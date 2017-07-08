import { inject, async, fakeAsync, flushMicrotasks, ComponentFixture, TestBed, tick, } from '@angular/core/testing';
import { NgModule, Component, Directive, ViewChild, ViewContainerRef, Injector, Inject, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule, MdDialogModule, MdDialog, MdDialogRef, MdButton } from '@angular/material';

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

describe('LoginDialogComponent', () => {

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
  let component: LoginDialogComponent;
  let debugEl: DebugElement;

  // tslint:disable-next-line:prefer-const
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;

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
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
    debugEl = viewContainerFixture.debugElement;

  });

  it('should be created', fakeAsync(() => {
    dialogRef = dialog.open(LoginDialogComponent);
    component = dialogRef.componentInstance;
    viewContainerFixture.detectChanges();

    expect(component).toBeTruthy();
    dialogRef.close()
    tick(500);
    viewContainerFixture.detectChanges();
  }));

  it('should return false when cancel button pressed', fakeAsync(() => {
    let result = true;
    dialogRef = dialog.open(LoginDialogComponent);

    viewContainerFixture.detectChanges();
    component = dialogRef.componentInstance;

    dialogRef.afterClosed().subscribe(dlgResult => {
      console.log('dialog result: ', dlgResult);
      result = dlgResult;
      console.log('result in subscribe:', result);
    });

    dialogRef.close(false);

    tick(500);
    viewContainerFixture.detectChanges();

    console.log('result after subscribe:', result);
    expect(result).toBeFalsy();
  }));

  describe('should disable login button', () => {
    it('without a user and password entry', fakeAsync(() => {
      dialogRef = dialog.open(LoginDialogComponent);
      component = dialogRef.componentInstance;
      viewContainerFixture.detectChanges();

      expect(component).toBeTruthy();
      dialogRef.close()
      tick(500);
      viewContainerFixture.detectChanges();
    }));

    it('with a user but without a password entry', fakeAsync(() => {
      dialogRef = dialog.open(LoginDialogComponent);
      component = dialogRef.componentInstance;
      viewContainerFixture.detectChanges();

      const btns = debugEl.queryAll(By.css('button'));
      // .find(b => {
      //   if (b.nativeElement.textContent === 'Login') {
      //     return true;
      //   }
      // });
      console.log('btns details: ', debugEl);

      expect(component).toBeTruthy();
      dialogRef.close()
      tick(500);
      viewContainerFixture.detectChanges();
    }));

    it('with a password but without a user entry', fakeAsync(() => {
      dialogRef = dialog.open(LoginDialogComponent);
      component = dialogRef.componentInstance;
      viewContainerFixture.detectChanges();

      expect(component).toBeTruthy();
      dialogRef.close()
      tick(500);
      viewContainerFixture.detectChanges();
    }));
  });

});

