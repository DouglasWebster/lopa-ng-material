import { TestBed, inject, async, fakeAsync, tick } from '@angular/core/testing';

import { fakeBackendProvider } from '../../../tests/fake-backend';
import { MockBackend } from '@angular/http/testing';
import { BaseRequestOptions, HttpModule } from '@angular/http';

import { UserService } from './user.service';
import { IUser } from '../models';

import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      declarations: [
      ],
      providers: [
        AuthenticationService,
        UserService,
        fakeBackendProvider,
        MockBackend,
        BaseRequestOptions
      ]
    });
  });

  beforeEach(() => {
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
  });

  it('should d create an authentication service by injection', async(inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  })));

  it('should report an error when trying to log in with no users created',
    fakeAsync(inject([AuthenticationService, UserService], (check: AuthenticationService, service: UserService) => {

      const user: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck', };
      check.login(user.userName, user.password).subscribe(
        data => {
          fail('Login should be returning an error');
        },
        error => {
          expect(error.message).toContain('Username or password is incorrect');
          expect(localStorage.currentUser).toBeUndefined();
        }
      );
      tick(500);
    })));

  it('should report an error when trying to log in with an invalid user',
    fakeAsync(inject([AuthenticationService, UserService], (check: AuthenticationService, service: UserService) => {
      const user: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck', };

      service.create(user).subscribe(
        data => { },
        error => fail(error)
      );
      tick(500);

      check.login('mMouse', 'Squeek').subscribe(
        data => {
          fail('Login should be returning an error');
        },
        error => {
          expect(error.message).toContain('Username or password is incorrect');
          expect(localStorage.currentUser).toBeUndefined();
        }
      );
      tick(500);
    })));

  it('should set "localStorage.currentUser" to the user.userName when login successful',
    fakeAsync(inject([AuthenticationService, UserService], (check: AuthenticationService, service: UserService) => {
      const user: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck', };

      service.create(user).subscribe(
        data => { },
        error => fail(error)
      );
      tick(500);

      check.login('dDuck', 'Quack').subscribe(
        data => {
          expect(data).toBeUndefined();
        },
        error => fail(error)
      );
      tick(500);

      expect(localStorage.currentUser).toContain('dDuck');
    })));

  it('should clear "localStorage.currentUser" when user logs out',
    fakeAsync(inject([AuthenticationService, UserService], (check: AuthenticationService, service: UserService) => {
      const user: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck', };

      expect(localStorage.currentUser).toBeUndefined();

      service.create(user).subscribe(
        data => { },
        error => fail(error)
      );
      tick(500);

      check.login('dDuck', 'Quack').subscribe(
        data => {
          expect(data).toBeUndefined();
        },
        error => fail(error)
      );
      tick(500);

      expect(localStorage.currentUser).toContain('dDuck');

      check.logout();
      expect(localStorage.currentUser).toBeUndefined();
    })));
});
