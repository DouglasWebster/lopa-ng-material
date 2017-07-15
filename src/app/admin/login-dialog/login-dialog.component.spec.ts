import { inject, async, fakeAsync, flushMicrotasks, ComponentFixture, TestBed, tick, } from '@angular/core/testing';
import { NgModule, Component, Directive, ViewChild, ViewContainerRef, Injector, Inject, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule, MdDialogModule, MdDialog, MdDialogRef, MdButton, OverlayContainer } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

import { AuthenticationService, AlertService } from '../../shared/services';
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
    MdDialogModule,
    ReactiveFormsModule,
    MaterialModule,
    NoopAnimationsModule
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
    '{"firstName":"Micky","lastName":"Mouse","userName":"mMouse", "password":"Password1","admin":true,"id":1}'
    + ', {"firstName": "Donald", "lastName": "Duck", "userName": "dDuck", "password": "Password2", "admin": false, "id": 2}'

  const authenticationServiceStub = {
    isValid(username?: string, password?: string): Observable<String> {
      return new Observable<String>((subscriber: Subscriber<String>) => subscriber.next(JSON.parse(fakeUser)));
    }
  }

  let dialog: MdDialog;
  let dialogRef: MdDialogRef<LoginDialogComponent>;
  // let component: LoginDialogComponent;

  let overlayContainerElement: HTMLElement;

  // let testViewContainerRef: ViewContainerRef;

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
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        AlertService
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
    // testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
    dialogRef = dialog.open(LoginDialogComponent);
    viewContainerFixture.detectChanges();

  });

  it('should be created', fakeAsync(() => {
    expect(dialogRef.componentInstance instanceof LoginDialogComponent).toBe(true, 'Failed to open');
    expect(overlayContainerElement.querySelector('h1').innerText).toEqual('App Login');

    dialogRef.close();
    tick(500);
    viewContainerFixture.detectChanges();
  }));

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

  describe('should disable login button', () => {
    it('without a user and password entry', fakeAsync(() => {

      const btn = overlayContainerElement.querySelector('button[md-raised-button]');
      expect(btn.getAttribute('ng-reflect-disabled')).toBe('true');

      dialogRef.close()
      tick(500);
      viewContainerFixture.detectChanges();
    }));

    it('with a user entry but without a password entry', async(() => {

      (overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement).value = 'DD';
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();
        const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]');
        const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]');

        expect((nameInput as HTMLInputElement).value).toEqual('DD');
        expect((passwordInput as HTMLInputElement).value).toEqual('');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with a password but without a user entry', async(() => {

      (overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement).value = 'Password';
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();
        const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]');
        const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]');

        expect((nameInput as HTMLInputElement).value).toEqual('');
        expect((passwordInput as HTMLInputElement).value).toEqual('Password');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with a valid user name but invalid password', async(() => {

      (overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement).value = 'ABC';
      (overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement).value = '1234567';
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();
        const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]');
        const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]');

        expect((nameInput as HTMLInputElement).value).toEqual('ABC');
        expect((passwordInput as HTMLInputElement).value).toEqual('1234567');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));

    it('with an invalid user name but with a valid password', async(() => {

      (overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement).value = 'AB';
      (overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement).value = '12345678';
      viewContainerFixture.detectChanges();

      viewContainerFixture.whenStable().then(() => {
        viewContainerFixture.detectChanges();
        const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]');
        const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]');

        expect((nameInput as HTMLInputElement).value).toEqual('AB');
        expect((passwordInput as HTMLInputElement).value).toEqual('12345678');
        expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('true');
      });
    }));
  });

  it('should enable the login button when a valid username and password are entered', fakeAsync(() => {
    (overlayContainerElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement).value = 'ABC';
    (overlayContainerElement.querySelector('input[formcontrolname="password"]') as HTMLInputElement).value = '12345678';
    viewContainerFixture.detectChanges();
    tick();

    viewContainerFixture.detectChanges();
    const loginBtn = overlayContainerElement.querySelector('button[md-raised-button]');
    const nameInput = overlayContainerElement.querySelector('input[formcontrolname="name"]');
    const passwordInput = overlayContainerElement.querySelector('input[formcontrolname="password"]');
    console.log('Login Button is:', loginBtn.textContent);
    console.log('Login Button is:', loginBtn.getAttribute('ng-reflect-disabled'));

    expect((nameInput as HTMLInputElement).value).toEqual('ABC');
    expect((passwordInput as HTMLInputElement).value).toEqual('12345678');
    expect((overlayContainerElement.querySelector('button[md-raised-button]')).getAttribute('ng-reflect-disabled')).toBe('false');
  }));
});

