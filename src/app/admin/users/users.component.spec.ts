
import { async, ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { Component, ViewChild, Injectable, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { UsersComponent } from './users.component';
import { IUser } from '../../shared/models';
import { UserService } from '../../shared/services/index';

@Injectable()
export class FakeUserService {

  users: IUser[] = [];

  constructor() {
    for (let i = 0; i < 4; i++) {
      const nextIndex = this.users.length + 1;

      const copiedData = this.users.slice();
      copiedData.push({
        firstName: `FN_${nextIndex}`,
        lastName: `LN_${nextIndex}`,
        userName: `fn_${nextIndex}`,
        password: `pw_${nextIndex}`,
        admin: ((nextIndex % 3) === 0),
        id: nextIndex
      });

      this.users = copiedData;

    }
  }

  getAll() {
    return Observable.of(this.users);
  }

  getById(id: number) {
    console.log(`UserService stub called with id of ${id}`);

    const filteredUsers: IUser[] = this.users.filter(chkUser => {
      return chkUser.id === id;
    });

    if (filteredUsers.length === 1) {
      return Observable.of(filteredUsers);
    } else {
      if (filteredUsers.length === 0) {
        return Observable.throw(Error(`No User with ${id} found`));
      } else {
        return Observable.throw(Error(`Multiple user with same ID ${id} found`));
      }
    }
  }

  create(newUser: IUser) {

    // validation
    const duplicateUser = this.users.filter(user => user.userName === newUser.userName).length;
    if (duplicateUser) {
      return Observable.throw(Error('Username "' + newUser.userName + '" is already taken'));
    }

    // do we have an admin account? If not make give this user admin rights.
    const adminUser = this.users.find(user => user.admin === true);
    if (!adminUser) {
      newUser.admin = true;
    } else {
      newUser.admin = false;
    }

    // save new user
    // let maxId = 0;
    // newUser.id = this.users.map<IUser>(obj => {
    //   if (obj.id >= maxId) { maxId = obj.id + 1; }
    // })[0].id;
    this.users.push(newUser);

    return;
  }

  update(user: IUser) {

    let userFound = false;
    // find user by id in users array
    const id = user.id;
    for (let i = 0; i < this.users.length; i++) {
      const testUser = this.users[i];
      if (testUser.id === id) {
        userFound = true;
        this.users[i].id = user.id;
        this.users[i].admin = user.admin;
        this.users[i].userName = user.userName;
        this.users[i].firstName = user.firstName;
        this.users[i].lastName = user.lastName;
        break;
      }
    }
    if (userFound) {
      return;
    } else {
      return Observable.throw(Error(`User ${user.userName} not found`));
    }
  }

  delete(id: number) {

    // find user by id in users array
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id) {
        // delete user
        this.users.splice(i, 1);
        break;
      }
    }

    return;
  }
}


fdescribe('UsersComponent', () => {

  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatToolbarModule,
        MatTableModule,
        MatSortModule,
        NoopAnimationsModule
      ],
      declarations: [
        UsersComponent
      ],
      providers: [
        { provide: UserService, useClass: FakeUserService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.detectChanges();
  });

  it('should be created with 4 rows of data', () => {

    // tslint:disable-next-line:no-non-null-assertion
    const tableElement = fixture.nativeElement.querySelector('.mat-table')!;
    const tblRows = getRows(tableElement).length;
    expect(component).toBeTruthy();
    expect(tblRows).toEqual(4);
  });

  it('should have 3 rows after 1 item is deleted', () => {
    // component.user


  });

});

// Utilities copied from CDKTable's spec
function getElements(element: Element, query: string): Element[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getHeaderRow(tableElement: Element): Element {
  // tslint:disable-next-line:no-non-null-assertion
  return tableElement.querySelector('.mat-header-row')!;
}

function getRows(tableElement: Element): Element[] {
  return getElements(tableElement, '.mat-row');
}
function getCells(row: Element): Element[] {
  return row ? getElements(row, '.mat-cell') : [];
}
