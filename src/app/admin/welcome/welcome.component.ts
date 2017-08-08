import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { User } from '../../shared/models';
import { UserService } from '../../shared/services';
import { AuthenticationService } from '../../shared/services';

@Component({
  selector: 'lpa-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  currentUser: User;
  users: User[] = [];

  constructor(
    private userService: UserService,
    private authenicationService: AuthenticationService,
    private loginDlg: MdDialog,
    private registerDlg: MdDialog,
    private newUserDlb: MdDialog) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log(`current user:`, this.currentUser);
  }

  ngOnInit() {
    this.loadAllUsers();
  }

  private loadAllUsers() {
    this.userService.getAll().subscribe(users => { this.users = users; });
  }

  public doLogin() {
    const loginDlgRef = this.loginDlg.open(LoginDialogComponent, { width: '450px' });
    loginDlgRef.afterClosed().subscribe(result => {
      console.log('Login Dialog returned', result);
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
  }
}
