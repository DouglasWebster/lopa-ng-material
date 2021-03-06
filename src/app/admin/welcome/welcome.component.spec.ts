import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { DebugElement, NgZone } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatDialogModule, MatToolbarModule, MatCardModule } from '@angular/material';
import { MatDialog, MatDialogRef, MatDialogContainer } from '@angular/material';
import { OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { RouterTestingModule } from '@angular/router/testing';

import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

import { IUser } from '../../shared/models';
// import { UserService } from '../../shared/services';
import { AuthenticationService } from '../../shared/services';

import { WelcomeComponent } from './welcome.component';

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatToolbarModule,
        MatCardModule,
        OverlayModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      declarations: [
        WelcomeComponent
      ],
      providers: [
        MatDialog,
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
    const deButtons = debugEl.queryAll(By.css('button[mat-raised-button]'));
    const buttons = deButtons.map(d => d.nativeElement);
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe('Login');
    expect(buttons[1].textContent).toBe('Register');
  });

  it('should have 2 butons in a non admin user is logged in', () => {
    component.currentUser = User2;
    fixture.detectChanges();
    console.log(component.currentUser);

    const btns = debugEl.queryAll(By.css('button[mat-raised-button'));
    expect(btns.length).toBe(2);
    expect(btns[0].nativeElement.textContent).toBe('Enter');
    expect(btns[1].nativeElement.textContent).toBe('Logout');
  });


  it('should have 3 buttons if an admin user is logged in', () => {
    component.currentUser = User1;
    fixture.detectChanges();
    console.log(component.currentUser);

    const btns = debugEl.queryAll(By.css('button[mat-raised-button]'));
    const aLinks = debugEl.queryAll(By.css('a[mat-raised-button]'));
    expect(btns.length).toBe(2);
    expect(aLinks.length).toBe(1);
    expect(btns[0].nativeElement.textContent).toBe('Enter');
    expect(btns[1].nativeElement.textContent).toBe('Logout');
    expect(aLinks[0].nativeElement.textContent).toBe('Administration');
  });
});
