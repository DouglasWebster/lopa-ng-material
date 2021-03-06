import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { IUser } from '../../shared/models';
import { AuthenticationService } from '../../shared/services';

@Component({
  selector: 'lpa-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  currentUser: IUser;
  users: IUser[] = [];
  salutation = '';

  constructor(
    private authenicationService: AuthenticationService,
    private loginDlg: MatDialog,
    private registerDlg: MatDialog) {
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      this.salutation = this.currentUser.firstName;
    }
  }


  public doLogin() {
    const loginDlgRef = this.loginDlg.open(LoginDialogComponent, { width: '450px' });
    loginDlgRef.afterClosed().subscribe(result => {
      console.log('Login Dialog returned', result);
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.salutation = this.currentUser.firstName;
    });
  }

  public doNewUser() {
    const registerDlgRef = this.registerDlg.open(RegisterDialogComponent, { width: '450px' });
    registerDlgRef.afterClosed().subscribe(result => {
      console.log('Register Dialog returned', result);
    });
  }

  public doLogout() {
    this.authenicationService.logout();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.salutation = '';
  }

  public doHome() { }

  public doAdmin() { }
}
