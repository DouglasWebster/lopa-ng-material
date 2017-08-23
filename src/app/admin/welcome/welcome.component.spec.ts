import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { DebugElement, NgZone } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule, MdDialog, MdDialogRef, OverlayRef, MdDialogContainer } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';

import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

import { User } from '../../shared/models';
// import { UserService } from '../../shared/services';
import { AuthenticationService } from '../../shared/services';

import { WelcomeComponent } from './welcome.component';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let debugEl: DebugElement;

  const fakeUsers = '[{}]';
  const User1 = { 'firstName': 'Micky', 'lastName': 'Mouse', 'userName': 'mMouse', 'password': 'Squeek', 'admin': true, 'id': 1 };
  const User2 = { 'firstName': 'Daffy', 'lastName': 'Duck', 'userName': 'dDuck', 'password': 'Quack', 'admin': false, 'id': 2 };

  // fake the Authentification service

  const authenticationServiceStub = {
    login(username?: string, password?: string) {
      if (username === 'mMouse') {
        localStorage.setItem('currentUser', JSON.stringify(User1));
        return Observable.of(User1);
      } else {
        if (username === 'dDuck') {
          localStorage.setItem('currentUser', JSON.stringify(User2));
          return Observable.of(User2);
        } else {
          return Observable.throw(Error('User Name of Password not recognised'));
        }
      }
    },

    logOut() {
      localStorage.removeItem('currentUser');
    }
  };

  // mocking a dialogRef for when we open our Md dialog with a button
  const dlgContainer = new MdDialogContainer(null, null, null, null);
  const mockDialogRef = new MdDialogRef(new OverlayRef(null, null, null, null, null), dlgContainer);
  mockDialogRef.componentInstance = new LoginDialogComponent(null, null, null);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      declarations: [
        WelcomeComponent
        // ,
        //  LoginDialogComponent
      ],
      providers: [
        MdDialog,
        // { provide: UserService, useValue: userServiceStub },
        { provide: AuthenticationService, useValue: authenticationServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    debugEl = fixture.debugElement;
    fixture.detectChanges();

  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have the Heading LOPA', () => {
    expect(debugEl.query(By.css('h1')).nativeElement.textContent).toContain('LOPA');
  });

  it('should have 2 buttons when there is no current user', () => {
    component.currentUser = null;
    fixture.detectChanges();
    const deButtons = debugEl.queryAll(By.css('button[md-raised-button]'));
    const buttons = deButtons.map(d => d.nativeElement);
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe('Login');
    expect(buttons[1].textContent).toBe('Register');
  });

  it('should have 2 butons in a non admin user is logged in', () => {
    component.currentUser = User2;
    fixture.detectChanges();
    console.log(component.currentUser);

    const btns = debugEl.queryAll(By.css('button[md-raised-button'));
    expect(btns.length).toBe(2);
    expect(btns[0].nativeElement.textContent).toBe('Enter');
    expect(btns[1].nativeElement.textContent).toBe('Logout');
  });


  it('should have 3 buttons if an admin user is logged in', () => {
    component.currentUser = User1;
    fixture.detectChanges();
    console.log(component.currentUser);

    const btns = debugEl.queryAll(By.css('button[md-raised-button]'));
    expect(btns.length).toBe(3);
    expect(btns[0].nativeElement.textContent).toBe('Enter');
    expect(btns[1].nativeElement.textContent).toBe('Logout');
    expect(btns[2].nativeElement.textContent).toBe('Administration');
  });
});
