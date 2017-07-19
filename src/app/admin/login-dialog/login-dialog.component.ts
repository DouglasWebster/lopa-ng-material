import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MdDialog, MdDialogRef } from '@angular/material';

import { AuthenticationService, AlertService } from '../../shared/services'

@Component({
  selector: 'lpa-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private dlgRef: MdDialogRef<LoginDialogComponent>
  ) {
    this.createForm()
  }

  ngOnInit() {
  }

  private createForm() {
    this.loginForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    })
  }

  public isValid() {
    console.log('login button pressed');

    this.authenticationService.login('', '')
      .subscribe(
      data => {
      },
      error => {
        this.alertService.error(error);
      });
  }

  public login() {
    this.dlgRef.close(this.loginForm.value.name);
  }

}
