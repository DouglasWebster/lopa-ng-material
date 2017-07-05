import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// used to create fake backend
import { fakeBackendProvider } from './shared/helpers/fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { BaseRequestOptions } from '@angular/http';

// Network services
import { AlertService, AuthenticationService, UserService } from './shared/services';
import { LoginGuard } from './shared/guards/login.guard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [
    AlertService,
    AuthenticationService,
    UserService,
    LoginGuard,

      // providers used to create fake backend
    fakeBackendProvider,
    MockBackend,
    BaseRequestOptions
],
  bootstrap: [AppComponent]
})
export class AppModule { }
