import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MdDialog, MdDialogRef } from '@angular/material';

import { AuthenticationService, AlertService } from '../../shared/services';

@Component({
  selector: 'lpa-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {
  loginForm: FormGroup;
  loginWarning = false;

  constructor(
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private dlgRef: MdDialogRef<LoginDialogComponent>
  ) {
    this.createForm();
  }

  ngOnInit() {
  }

  private createForm() {
    this.loginForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  public login() {
    this.loginWarning = false;
    console.log('login button pressed');
    const name2Check = this.loginForm.value.name;
    const pass2Check = this.loginForm.value.password;
    this.authenticationService.login(name2Check, pass2Check)
      .subscribe(
      data => {
        console.log('login valid');
        this.dlgRef.close(this.loginForm.value.name);
      },
      error => {
        console.log('login invalid');
        this.loginWarning = true;
      });
  }
}
