import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule, MdDialogModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

// Network services
import { LoginGuard } from '../shared/guards/login.guard';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { RegisterDialogComponent } from './register-dialog/register-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
    MdDialogModule,
    ReactiveFormsModule
  ],
  declarations: [
    AdminComponent,
    WelcomeComponent,
    LoginDialogComponent,
    RegisterDialogComponent
  ],
  entryComponents: [
    LoginDialogComponent,
    RegisterDialogComponent
  ]
})
export class AdminModule { }
