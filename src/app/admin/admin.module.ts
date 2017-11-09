import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MaterialModule, MdDialogModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

// Network services
import { LoginGuard } from '../shared/guards/login.guard';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { RegisterDialogComponent } from './register-dialog/register-dialog.component';
import { UsersComponent } from './users/users.component';
import { AppMaterialModule } from '../app.material.module';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    AppMaterialModule
  ],
  declarations: [
    AdminComponent,
    WelcomeComponent,
    LoginDialogComponent,
    RegisterDialogComponent,
    UsersComponent
  ],
  entryComponents: [
    LoginDialogComponent,
    RegisterDialogComponent
  ]
})
export class AdminModule { }
