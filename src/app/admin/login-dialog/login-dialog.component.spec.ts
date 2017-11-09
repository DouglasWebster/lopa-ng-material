import { inject, async, fakeAsync, flushMicrotasks, ComponentFixture, TestBed, tick, } from '@angular/core/testing';
import { NgModule, Component, Directive, ViewChild, ViewContainerRef, Injector, Inject, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatDialogModule, MatButtonModule, MatInputModule } from '@angular/material';
import { MatDialog, MatDialogRef, MatButton, } from '@angular/material';
import { OverlayModule, OverlayContainer } from '@angular/cdk/overlay';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import { Subscriber } from 'rxjs/Subscriber';

import { AuthenticationService } from '../../shared/services';
import { LoginDialogComponent } from './login-dialog.component';

// helper classes
// tslint:disable-next-line:directive-selector
@Directive({ selector: 'dir-with-view-container' })
class DlgTestViewContainerDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
  selector: 'lpa-arbitrary-component',
  template: `<dir-with-view-container></dir-with-view-container>`,
})
class DlgTestChildViewContainerComponent {
  @ViewChild(DlgTestViewContainerDirective) childWithViewContainer: DlgTestViewContainerDirective;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_DIRECTIVES = [
  DlgTestViewContainerDirective,
  DlgTestChildViewContainerComponent,
  LoginDialogComponent
];

@NgModule({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    OverlayModule,
    ReactiveFormsModule,
    NoopAnimationsModule,
    CommonModule
  ],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    LoginDialogComponent
  ]
})
class DialogTestModule { }

describe('Login Dialog Component', () => {

  // fake the Authentification service
  const fakeUser =
    '[{"firstName":"Micky","lastName":"Mouse","userName":"mMouse", "password":"Password1","admin":true,"id":1}'
    + ', {"firstName": "Donald", "lastName": "Duck", "userName": "dDuck", "password": "Password2", "admin": false, "id": 2}]';

  const authenticationServiceStub = {
    login(username?: string, password?: string) {
      console.log(`Athenticate stub called with ${username} ${password}`);

      const users = JSON.parse(fakeUser);
      const filteredUsers = users.filter(user => {
        return user.userName === username && user.password === password;
      });

      if (filteredUsers.length) {
        return Observable.of(filteredUsers);
      } else {
        return Observable.throw(Error('User Name of Password not recognised'));
      }
    }
  };

  let dialog: MatDialog;
  let dialogRef: MatDialogRef<LoginDialogComponent>;
  let component: LoginDialogComponent;

  let overlayContainerElement: HTMLElement;
  let viewContainerFixture: ComponentFixture<DlgTestChildViewContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DialogTestModule,
        RouterTestingModule
      ],
      declarations: [
      ],
      providers: [
        {
          provide: OverlayContainer, useFactory: () => {
            overlayContainerElement = document.createElement('div');
            return { getContainerElement: () => overlayContainerElement };
          }
        },
        { provide: AuthenticationService, useValue: authenticationServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(inject([MatDialog], (d: MatDialog) => {
    dialog = d;
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(DlgTestChildViewContainerComponent);
    viewContainerFixture.detectChanges();
    dialogRef = dialog.open(LoginDialogComponent);
    component = dialogRef.componentInstance;
    viewContainerFixture.detectChanges();
  });

  it('should be created', () => {
    expect(dialogRef.componentInstance instanceof LoginDialogComponent).toBe(true, 'Failed to open');
    const heading = overlayContainerElement.querySelector('.mat-dialog-title') as HTMLHeadingElement;
    expect(heading.innerText).toEqual('App Login');
  });

  it('should open with user and password blank and the login button dissabled', () => {
    const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
    const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
    const btn = overlayContainerElement.querySelector('button[mat-raised-button]');
    expect(nameInput.value).toEqual('');
    expect(passwordInput.value).toEqual('');
    expect(btn.getAttribute('ng-reflect-disabled')).toBe('true');
  });

  it('should not be showing the User not recognised error message', () => {
    expect(component.loginWarning).toBeFalsy('component loginWarning variable set to true');

    const notRecognisedMsg = overlayContainerElement.querySelector('.warn');
    expect(notRecognisedMsg).toBeNull('Not recognised message showing on dialog');

  });

  it('should show the User not recognised error message when \'logingWarning\' set', () => {
    expect(component.loginWarning).toBeFalsy('component loginWarning variable set to true');

    let notRecognisedMsg = overlayContainerElement.querySelector('.warn') as HTMLTextAreaElement;
    component.loginWarning = true;
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      notRecognisedMsg = overlayContainerElement.querySelector('.warn') as HTMLTextAreaElement;
      expect(notRecognisedMsg.innerText).toContain('User Name and', 'Not recognised message is not showing on dialog');
    });

  });

  it('should close and return false when cancel button pressed', async(() => {
    const afterCloseCallback = jasmine.createSpy('afterClose callback');

    dialogRef.afterClosed().subscribe(afterCloseCallback);
    (overlayContainerElement.querySelector('button[mat-dialog-close="false"]') as HTMLElement).click();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull('Dialog box still open');
      expect(afterCloseCallback).toHaveBeenCalledWith('false');
    });
  }));

  describe('should disable login button', () => {

    it('with a user entry but without a password entry', async(() => {
      const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      nameInput.value = 'DD';
      nameInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(nameInput.value).toEqual('DD');
        expect(passwordInput.value).toEqual('');
        expect((overlayContainerElement.querySelector('button[mat-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with a password but without a user entry', async(() => {
      const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      passwordInput.value = 'Password';
      passwordInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(nameInput.value).toEqual('');
        expect(passwordInput.value).toEqual('Password');
        expect((overlayContainerElement.querySelector('button[mat-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with a valid user name but invalid password', async(() => {
      const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      nameInput.value = 'ABC';
      nameInput.dispatchEvent(new Event('input'));
      passwordInput.value = '1234567';
      passwordInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(nameInput.value).toEqual('ABC');
        expect(passwordInput.value).toEqual('1234567');
        expect((overlayContainerElement.querySelector('button[mat-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with an invalid user name but with a valid password', async(() => {
      const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      nameInput.value = 'AB';
      nameInput.dispatchEvent(new Event('input'));
      passwordInput.value = '12345678';
      passwordInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(nameInput.value).toEqual('AB');
        expect(passwordInput.value).toEqual('12345678');
        expect((overlayContainerElement.querySelector('button[mat-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with an invalid user name and an invalid password', async(() => {
      const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      nameInput.value = 'AB';
      nameInput.dispatchEvent(new Event('input'));
      passwordInput.value = '1234567';
      passwordInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(nameInput.value).toEqual('AB');
        expect(passwordInput.value).toEqual('1234567');
        expect((overlayContainerElement.querySelector('button[mat-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));
  });

  it('should enable the login button when a valid username and password are entered', async(() => {
    const loginBtn = overlayContainerElement.querySelector('button[mat-raised-button]') as HTMLButtonElement;
    const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
    const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
    nameInput.value = 'ABC';
    nameInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      viewContainerFixture.detectChanges();
      expect(nameInput.value).toEqual('ABC');
      expect(passwordInput.value).toEqual('12345678');
      expect(loginBtn.getAttribute('ng-reflect-disabled')).toBe('false', 'Login button disabled should now be false');
    });
  }));

  it('should notify the user if the login credentials cannot be verified', async(() => {
    const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
    const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;

    let warnMsg = overlayContainerElement.querySelector('.warn') as HTMLTextAreaElement;
    expect(warnMsg).toBeNull('warning message showing when should\'nt be');
    expect(component.loginWarning).toBeFalsy();

    nameInput.value = 'ABC';
    nameInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));
    viewContainerFixture.detectChanges();
    component.login();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      viewContainerFixture.detectChanges();
      expect(component.loginWarning).toBeTruthy();
      warnMsg = overlayContainerElement.querySelector('.warn') as HTMLTextAreaElement;
      expect(warnMsg.innerText).toContain('User Name and/or ', 'warning message should be visible');

    });
  }));

  it('should close the dialog and return the user details when a user is verified', async(() => {
    const afterCloseCallback = jasmine.createSpy('afterClose callback');

    dialogRef.afterClosed().subscribe(afterCloseCallback);
    const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
    const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;

    nameInput.value = 'mMouse';
    nameInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'Password1';
    passwordInput.dispatchEvent(new Event('input'));
    viewContainerFixture.detectChanges();
    component.login();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull('Dialog box still open');
      expect(afterCloseCallback).toHaveBeenCalledWith('mMouse');
    });
  }));

});

