import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';

import { AuthenticationService, UserService } from '../../shared/services';

import { IUser } from '../../shared/models';

@Component({
  selector: 'lpa-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss']
})
export class RegisterDialogComponent implements OnInit {
  registerForm: FormGroup;
  model: IUser;
  loading = false;
  registerFailure = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private dlgRef: MatDialogRef<RegisterDialogComponent>
  ) {
    this.createForm();
  }

  private createForm() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  public register() {
    this.loading = true;
    this.prepareModel();
    this.userService.create(this.model)
      .subscribe(
      data => {
        console.log('register OK');
        // clear the loading message and set the success flag
        this.loading = false;
        this.dlgRef.close(this.model.userName);
      },
      error => {
        console.log('Register Failed: ', error);
        this.loading = false;
        this.registerFailure = error.message;
      });
  }

  private prepareModel() {
    const formModel = this.registerForm.value;

    this.model = {
      firstName: formModel.firstName,
      lastName: formModel.lastName,
      userName: formModel.userName,
      password: formModel.password
    };

  }

  ngOnInit() {
  }

}
