import { TestBed, inject, async, fakeAsync, tick } from '@angular/core/testing';

import { fakeBackendProvider } from '../../../tests/fake-backend';
import { MockBackend } from '@angular/http/testing';
import { BaseRequestOptions, HttpModule } from '@angular/http';

import { UserService } from './user.service';
import { IUser } from '../models';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
      ],
      declarations: [
      ],
      providers: [
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

  it('should create a user service by injection', async(inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  })));

  describe('when no users have been created', () => {
    it('should return null if trying to get a list of users', async(inject([UserService], (service: UserService) => {

      service.getAll().subscribe(
        data => {
          expect(data).toBeNull();
        },
        error => {
          fail('should respond with null not with an error');
        }
      );
    })));

    it('should return null if trying to get a user by id', async(inject([UserService], (service: UserService) => {

      service.getById(1).subscribe(
        data => {
          expect(data).toBeNull();
        },
        error => {
          fail('should respond with null not with an error');
        }
      );
    })));

    it('should return null if trying to create a user', async(inject([UserService], (service: UserService) => {
      const user: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck', };

      service.create(user).subscribe(
        data => {
          expect(data).toBeNull();
        },
        error => {
          fail('should respond with null not with an error');
        }
      );
    })));

    it('should return null if trying to delete a user', async(inject([UserService], (service: UserService) => {
      const user: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck', };

      service.delete(1).subscribe(
        data => {
          expect(data).toBeNull();
        },
        error => {
          fail('should respond with null not with an error');
        }
      );
    })));

    it('should return null if trying to update a user', async(inject([UserService], (service: UserService) => {
      const user: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck', 'id': 1};

    service.update(user).subscribe(
      data => {
        expect(data).toBeNull();
      },
      error => {
        fail('unable to update user details');
      }
    );
    })));
  });

  it('should create a user', async(inject([UserService], (service: UserService) => {
    const user: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck', };

    service.create(user).subscribe(
      (data) => {
        expect(data).toBeNull('Success should not return anything');
      },
      error => {
        fail(error);
      }
    );
  })));

  it('should add a second item that has a unique user name', async(inject([UserService], (service: UserService) => {
    console.log('Users :', localStorage.getItem('users'));

    const user0: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck', };
    const user1: IUser = { 'userName': 'mMouse', 'password': 'Squeek', 'firstName': 'Micky', 'lastName': 'Mouse', };

    service.create(user0).subscribe(
      (data) => {
        expect(data).toBeNull('Create first users should not return anything');
      },
      error => {
        fail(error);
      }
    );

    service.create(user1).subscribe(
      (data) => {
        expect(data).toBeNull('Create second users should not return anything');
      },
      error => {
        fail(error);
      }
    );
  })));

  it('should not add an item with a duplicate user name', async(inject([UserService], (service: UserService) => {
    console.log('Users :', localStorage.getItem('users'));

    const user0: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck', };

    service.create(user0).subscribe(
      (data) => {
        expect(data).toBeNull('Create first users should not return anything');
      },
      error => {
        fail(error);
      }
    );

    service.create(user0).subscribe(
      data => {
        fail('Creating a second users should have occured');
      },
      error => {
        expect(error.message).toContain('Username "' + user0.userName + '" is already taken');
      }
    );
  })));

  it('should return all the users currently registerd', fakeAsync(inject([UserService], (service: UserService) => {
    const user0: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck' };
    const user1: IUser = { 'userName': 'mMouse', 'password': 'Squeek', 'firstName': 'Micky', 'lastName': 'Mouse' };
    const userWithToken = {
      'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald',
      'lastName': 'Duck', 'token': 'fake-jwt-token'
    };

    let users: any[] = JSON.parse(localStorage.getItem('users')) || [];

    expect(users.length).toBe(0, 'There should be no users defineded at this point');

    service.create(user0).subscribe(
      (data) => {
        users = JSON.parse(localStorage.getItem('users'));
        expect(data).toBeNull('Create first users should not return anything');
        expect(users.length).toBe(1, 'There should be one users defineded at this point');
        localStorage.setItem('currentUser', JSON.stringify(userWithToken));
      },
      error => {
        fail(error);
      }
    );

    tick(500);

    service.create(user1).subscribe(
      (data) => {
        users = JSON.parse(localStorage.getItem('users'));
        expect(data).toBeNull('Create second users should not return anything');
        expect(users.length).toBe(2, 'There should be two users defineded at this point');
      },
      error => {
        fail(error);
      }
    );
    tick(500);

    service.getAll().subscribe(
      data => {
        console.log('GetAll() returns: ', data);
        expect(data.length).toBe(2);
        expect(data[0].userName).toBe('dDuck');
        expect(data[1].userName).toBe('mMouse');
      },
      error => {
        fail(error);
      }
    );
    tick(500);
  })));


  it('should be able to delete users given a valid userId', async(inject([UserService], (service: UserService) => {
    const user0: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck' };
    const user1: IUser = { 'userName': 'mMouse', 'password': 'Squeek', 'firstName': 'Micky', 'lastName': 'Mouse' };
    const userWithToken = {
      'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald',
      'lastName': 'Duck', 'token': 'fake-jwt-token'
    };
    localStorage.setItem('currentUser', JSON.stringify(userWithToken));

    let mMouseId = -1;

    service.create(user0).subscribe(
      (data) => {
      },
      error => fail(`Creating User 1 failed: ${error}`),
      () => {
        service.create(user1).subscribe(
          (data) => {
          },
          error => fail(`Creating User 2 failed: ${error}`),
          () => {
            service.getAll().subscribe(
              data => {
                const mMouse: IUser = data.filter(user => {
                  return user.userName === 'mMouse';
                });
                mMouseId = mMouse[0].id;
              },
              error => fail(`Getting all users failed: ${error}`),
              () => {
                service.delete(mMouseId).subscribe(
                  data => {
                  },
                  error => fail(`Deleting user with id ${mMouseId} failed: ${error}`),
                  () => {
                    service.getAll().subscribe(
                      data => {
                        expect(data.length).toBe(1);
                        expect(data[0].userName).not.toContain('mMouse');
                        expect(data[0].userName).toContain('dDuck');
                      },
                      error => fail('Getting users after delete')
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  })));

  it('should get user details by supplying a user ID', fakeAsync(inject([UserService], (service: UserService) => {
    const user0: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck' };
    const user1: IUser = { 'userName': 'mMouse', 'password': 'Squeek', 'firstName': 'Micky', 'lastName': 'Mouse' };
    const userWithToken = {
      'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald',
      'lastName': 'Duck', 'token': 'fake-jwt-token'
    };

    let users: any[] = JSON.parse(localStorage.getItem('users')) || [];

    expect(users.length).toBe(0, 'There should be no users defineded at this point');

    let mMouseId = -1;

    service.create(user0).subscribe(
      (data) => {
        users = JSON.parse(localStorage.getItem('users'));
        expect(data).toBeNull('Create first users should not return anything');
        expect(users.length).toBe(1, 'There should be one users defineded at this point');
        localStorage.setItem('currentUser', JSON.stringify(userWithToken));
      },
      error => {
        fail(error);
      }
    );

    tick(500);

    service.create(user1).subscribe(
      (data) => {
        users = JSON.parse(localStorage.getItem('users'));
        expect(data).toBeNull('Create second users should not return anything');
        expect(users.length).toBe(2, 'There should be two users defineded at this point');
      },
      error => {
        fail(error);
      }
    );
    tick(500);

    service.getAll().subscribe(
      data => {
        console.log('GetAll() returns: ', data);
        const mMouse: IUser = data.filter(user => {
          return user.userName === 'mMouse';
        });
        mMouseId = mMouse[0].id;
      },
      error => fail(error)
    );
    tick(500);

    service.getById(mMouseId).subscribe(
      data => {
        expect(data).toBeDefined();
        expect(data.userName).toBe('mMouse');
        expect(data.password).toBe('Squeek');
      },
      error => fail(error)
    );
    tick(500);
  })));

  it('should be able to update the user information', fakeAsync(inject([UserService], (service: UserService) => {
    const user0: IUser = { 'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald', 'lastName': 'Duck' };
    const user1: IUser = { 'userName': 'mMouse', 'password': 'Squeek', 'firstName': 'Micky', 'lastName': 'Mouse' };
    const userWithToken = {
      'userName': 'dDuck', 'password': 'Quack', 'firstName': 'Donald',
      'lastName': 'Duck', 'token': 'fake-jwt-token'
    };

    let users: any[] = JSON.parse(localStorage.getItem('users')) || [];

    expect(users.length).toBe(0, 'There should be no users defineded at this point');

    service.create(user0).subscribe(
      (data) => {
        users = JSON.parse(localStorage.getItem('users'));
        expect(data).toBeNull('Create first users should not return anything');
        expect(users.length).toBe(1, 'There should be one users defineded at this point');
        localStorage.setItem('currentUser', JSON.stringify(userWithToken));
      },
      error => {
        fail(error);
      }
    );

    tick(500);

    service.create(user1).subscribe(
      (data) => {
        users = JSON.parse(localStorage.getItem('users'));
        expect(data).toBeNull('Create second users should not return anything');
        expect(users.length).toBe(2, 'There should be two users defineded at this point');
      },
      error => {
        fail(error);
      }
    );
    tick(500);

    service.getAll().subscribe(
      data => {
        console.log('GetAll() returns: ', data);
        const mMouse: IUser = data.filter(user => {
          return user.userName === 'mMouse';
        });
        user1.id = mMouse[0].id;
      },
      error => fail(error)
    );
    tick(500);

    user1.firstName = 'Minnie';
    service.update(user1).subscribe(
      data => {

      },
      error => {
        fail('unable to update user details');
      }
    );
    tick(500);

    service.getById(user1.id).subscribe(
      data => {
        expect(data).toBeDefined();
        expect(data.userName).toBe('mMouse');
        expect(data.firstName).toBe('Minnie');
      },
      error => fail(error)
    );
    tick(500);

  })));

});
