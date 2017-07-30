import { inject, async, fakeAsync, flushMicrotasks, ComponentFixture, TestBed, tick, } from '@angular/core/testing';
import { NgModule, Component, Directive, ViewChild, ViewContainerRef, Injector, Inject, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule, MdDialogModule, MdDialog, MdDialogRef, MdButton, OverlayContainer } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import { Subscriber } from 'rxjs/Subscriber';

import { UserService } from '../../shared/services';
import { RegisterDialogComponent } from './register-dialog.component';
import { User } from '../../shared/models/user';

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
  RegisterDialogComponent
];

@NgModule({
  imports: [
    MdDialogModule,
    ReactiveFormsModule,
    MaterialModule,
    NoopAnimationsModule,
    CommonModule
  ],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    RegisterDialogComponent
  ]
})
class DialogTestModule { }

describe('RegisterDialogComponent', () => {

  // fake the User service
  const fakeUser =
    '[{"firstName":"Micky","lastName":"Mouse","userName":"mMouse", "password":"Password1","admin":true,"id":1}]';

  const userServiceStub = {
    create(user: User) {
      console.log(`UserService stub called with ${user}`);

      const username = user.userName;
      const users = JSON.parse(fakeUser);
      const filteredUsers = users.filter(chkUser => {
        return chkUser.userName === username;
      });

      if (filteredUsers.length) {
        return Observable.throw(Error(`Username "${username}" is already taken`));
      } else {
        return Observable.of(filteredUsers);
      }
    }

  };

  let dialog: MdDialog;
  let dialogRef: MdDialogRef<RegisterDialogComponent>;
  let component: RegisterDialogComponent;

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
        { provide: UserService, useValue: userServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(inject([MdDialog], (d: MdDialog) => {
    dialog = d;
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(DlgTestChildViewContainerComponent);
    viewContainerFixture.detectChanges();
    dialogRef = dialog.open(RegisterDialogComponent);
    component = dialogRef.componentInstance;
    viewContainerFixture.detectChanges();
  });

  it('should be created', () => {
    expect(dialogRef.componentInstance instanceof RegisterDialogComponent).toBe(true, 'Failed to open');
    const heading = overlayContainerElement.querySelector('.mdl-dialog-title') as HTMLHeadingElement;
    expect(heading.innerText).toEqual('Register User');
  });

  it('should not be showing an error message', () => {
    expect(component.registerFailure).toBe('', 'component registerFailure string should be empty');

    const failuerMsg = overlayContainerElement.querySelector('.warn');
    expect(failuerMsg).toBeNull('Failure message showing on dialog');
  });

  it('should open with all fields blank and the login button dissabled', () => {
    const btn = overlayContainerElement.querySelector('button[md-raised-button]');
    const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
    const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
    const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
    const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
    expect(firstNameInput.value).toBe('', 'First name field not blank');
    expect(lastNameInput.value).toBe('', 'Last name field not blank');
    expect(userNameInput.value).toBe('', 'User name field not blank');
    expect(passwordInput.value).toBe('', 'Password field not blank');
    expect(btn.getAttribute('ng-reflect-disabled')).toBe('true', 'Login button enabled');
  });

  it('should close and return false when cancel button pressed', async(() => {
    const afterCloseCallback = jasmine.createSpy('afterClose callback');

    dialogRef.afterClosed().subscribe(afterCloseCallback);
    (overlayContainerElement.querySelector('button[md-dialog-close="false"]') as HTMLElement).click();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelector('md-dialog-container')).toBeNull('Dialog box still open');
      expect(afterCloseCallback).toHaveBeenCalledWith('false');
    });
  }));

  describe('should disable register button', () => {

    it('with a first name entry but without any other entry', async(() => {
      const btn = overlayContainerElement.querySelector('button[md-raised-button]');
      const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
      const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
      const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      firstNameInput.value = 'AB';
      firstNameInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(firstNameInput.value).toBe('AB', 'First Name changed on refresh');
        expect(lastNameInput.value).toBe('', 'Last Name changed on refresh');
        expect(userNameInput.value).toBe('', 'User Name changed on refresh');
        expect(passwordInput.value).toBe('', 'Password changed on refresh');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with a last name entry but without any other entry', async(() => {
      const btn = overlayContainerElement.querySelector('button[md-raised-button]');
      const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
      const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
      const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      lastNameInput.value = 'CD';
      lastNameInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(firstNameInput.value).toBe('', 'First Name changed on refresh');
        expect(lastNameInput.value).toBe('CD', 'Last Name changed on refresh');
        expect(userNameInput.value).toBe('', 'User Name changed on refresh');
        expect(passwordInput.value).toBe('', 'Password changed on refresh');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with a user name entry but without any other entry', async(() => {
      const btn = overlayContainerElement.querySelector('button[md-raised-button]');
      const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
      const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
      const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      userNameInput.value = 'EF';
      userNameInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(firstNameInput.value).toBe('', 'First Name changed on refresh');
        expect(lastNameInput.value).toBe('', 'Last Name changed on refresh');
        expect(userNameInput.value).toBe('EF', 'User Name changed on refresh');
        expect(passwordInput.value).toBe('', 'Password changed on refresh');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with a password entry but without any other entry', async(() => {
      const btn = overlayContainerElement.querySelector('button[md-raised-button]');
      const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
      const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
      const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      passwordInput.value = '123';
      passwordInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(firstNameInput.value).toBe('', 'First Name changed on refresh');
        expect(lastNameInput.value).toBe('', 'Last Name changed on refresh');
        expect(userNameInput.value).toBe('', 'User Name changed on refresh');
        expect(passwordInput.value).toBe('123', 'Password changed on refresh');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with a valid first name entry but with other entries invalid', async(() => {
      const btn = overlayContainerElement.querySelector('button[md-raised-button]');
      const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
      const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
      const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      firstNameInput.value = 'AB';
      firstNameInput.dispatchEvent(new Event('input'));
      lastNameInput.value = '';
      lastNameInput.dispatchEvent(new Event('input'));
      userNameInput.value = 'EF';
      userNameInput.dispatchEvent(new Event('input'));
      passwordInput.value = '1234567';
      passwordInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(firstNameInput.value).toBe('AB', 'First Name changed on refresh');
        expect(lastNameInput.value).toBe('', 'Last Name changed on refresh');
        expect(userNameInput.value).toBe('EF', 'User Name changed on refresh');
        expect(passwordInput.value).toBe('1234567', 'Password changed on refresh');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with a valid first name and last name entry but with other entries invalid', async(() => {
      const btn = overlayContainerElement.querySelector('button[md-raised-button]');
      const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
      const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
      const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      firstNameInput.value = 'AB';
      firstNameInput.dispatchEvent(new Event('input'));
      lastNameInput.value = 'CD';
      lastNameInput.dispatchEvent(new Event('input'));
      userNameInput.value = 'EF';
      userNameInput.dispatchEvent(new Event('input'));
      passwordInput.value = '1234567';
      passwordInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(firstNameInput.value).toBe('AB', 'First Name changed on refresh');
        expect(lastNameInput.value).toBe('CD', 'Last Name changed on refresh');
        expect(userNameInput.value).toBe('EF', 'User Name changed on refresh');
        expect(passwordInput.value).toBe('1234567', 'Password changed on refresh');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with valid entries except for the password entry', async(() => {
      const btn = overlayContainerElement.querySelector('button[md-raised-button]');
      const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
      const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
      const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      firstNameInput.value = 'AB';
      firstNameInput.dispatchEvent(new Event('input'));
      lastNameInput.value = 'CD';
      lastNameInput.dispatchEvent(new Event('input'));
      userNameInput.value = 'EFG';
      userNameInput.dispatchEvent(new Event('input'));
      passwordInput.value = '1234567';
      passwordInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(firstNameInput.value).toBe('AB', 'First Name changed on refresh');
        expect(lastNameInput.value).toBe('CD', 'Last Name changed on refresh');
        expect(userNameInput.value).toBe('EFG', 'User Name changed on refresh');
        expect(passwordInput.value).toBe('1234567', 'Password changed on refresh');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with valid entries except for the username entry', async(() => {
      const btn = overlayContainerElement.querySelector('button[md-raised-button]');
      const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
      const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
      const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
      const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
      firstNameInput.value = 'AB';
      firstNameInput.dispatchEvent(new Event('input'));
      lastNameInput.value = 'CD';
      lastNameInput.dispatchEvent(new Event('input'));
      userNameInput.value = 'EF';
      userNameInput.dispatchEvent(new Event('input'));
      passwordInput.value = '12345678';
      passwordInput.dispatchEvent(new Event('input'));
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();

        expect(firstNameInput.value).toBe('AB', 'First Name changed on refresh');
        expect(lastNameInput.value).toBe('CD', 'Last Name changed on refresh');
        expect(userNameInput.value).toBe('EF', 'User Name changed on refresh');
        expect(passwordInput.value).toBe('12345678', 'Password changed on refresh');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));
  });
  it('should enable the register button when all entries are valid', async(() => {
    const btn = overlayContainerElement.querySelector('button[md-raised-button]');
    const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
    const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
    const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
    const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
    firstNameInput.value = 'AB';
    firstNameInput.dispatchEvent(new Event('input'));
    lastNameInput.value = 'CD';
    lastNameInput.dispatchEvent(new Event('input'));
    userNameInput.value = 'EFg';
    userNameInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      viewContainerFixture.detectChanges();

      expect(firstNameInput.value).toBe('AB', 'First Name changed on refresh');
      expect(lastNameInput.value).toBe('CD', 'Last Name changed on refresh');
      expect(userNameInput.value).toBe('EFg', 'User Name changed on refresh');
      expect(passwordInput.value).toBe('12345678', 'Password changed on refresh');
      expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('false');
    });
  }));

  it('should notify the user if the register action fails', async(() => {
    const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
    const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
    const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
    const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;

    let warnMsg = overlayContainerElement.querySelector('.warn') as HTMLTextAreaElement;
    expect(warnMsg).toBeNull();

    firstNameInput.value = 'Mickey';
    firstNameInput.dispatchEvent(new Event('input'));
    lastNameInput.value = 'Mouse';
    lastNameInput.dispatchEvent(new Event('input'));
    userNameInput.value = 'mMouse';
    userNameInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'Password1';
    passwordInput.dispatchEvent(new Event('input'));
    viewContainerFixture.detectChanges();
    component.register();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      viewContainerFixture.detectChanges();
      expect(component.registerFailure).toBeTruthy();
      warnMsg = overlayContainerElement.querySelector('.warn') as HTMLTextAreaElement;
      expect(warnMsg.innerText).toContain(userNameInput.value);
    });
  }));

  it('should close the dialog and return the userName when a user is created', async(() => {
    const afterCloseCallback = jasmine.createSpy('afterClose callback');
    dialogRef.afterClosed().subscribe(afterCloseCallback);

    const firstNameInput = overlayContainerElement.querySelector('input[formcontrolname="firstName"]') as HTMLInputElement;
    const lastNameInput = overlayContainerElement.querySelector('input[formcontrolname="lastName"]') as HTMLInputElement;
    const userNameInput = overlayContainerElement.querySelector('input[formcontrolname="userName"]') as HTMLInputElement;
    const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement;

    firstNameInput.value = 'Daffy';
    firstNameInput.dispatchEvent(new Event('input'));
    lastNameInput.value = 'Duck';
    lastNameInput.dispatchEvent(new Event('input'));
    userNameInput.value = 'dDuck';
    userNameInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'Password2';
    passwordInput.dispatchEvent(new Event('input'));
    viewContainerFixture.detectChanges();
    component.register();
    viewContainerFixture.detectChanges();

    viewContainerFixture.whenStable().then(() => {
      expect(overlayContainerElement.querySelector('md-dialog-container')).toBeNull('Dialog box still open');
      expect(afterCloseCallback).toHaveBeenCalledWith(userNameInput.value);
    });
  }));
});
