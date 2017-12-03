import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatSort } from '@angular/material/sort';

import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

import { UserService } from '../../shared/services';
import { IUser } from '../../shared/models/';

export class UsersDataSource extends DataSource<any> {

  constructor(private _subject: BehaviorSubject<IUser[]>, private _sort: MatSort) {
    super();
  }

  connect(): Observable<IUser[]> {
    const displayDataChanges = [
      this._subject.value,
      this._sort.sortChange
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this.getSortedData();
    });

  }

  disconnect(): void { }

  getSortedData(): IUser[] {
    const data = this._subject.value;
    if (!this._sort.active || this._sort.direction === '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'firstName': [propertyA, propertyB] = [a.firstName, b.firstName]; break;
        case 'lastName': [propertyA, propertyB] = [a.lastName, b.lastName]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }
}
@Component({
  selector: 'lpa-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  displayedColumns = ['firstName', 'lastName', 'admin'];
  dataSource: UsersDataSource | null;
  dataSubject: BehaviorSubject<IUser[]> = new BehaviorSubject<IUser[]>([]);
  users: IUser[] = [];

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private userService: UserService
  ) {
  }

  ngOnInit() {
    console.log('In the ngOnInitFunction');
    this.userService.getAll().subscribe(
      data => {
        console.log('Initial data: ', data);
        this.users = <IUser[]>data;
        this.dataSubject.next(this.users);
        this.dataSource = new UsersDataSource(this.dataSubject, this.sort);
        this.sort.active = 'firstName';
        this.sort.direction = 'asc';

        console.log('Registered Users: ', this.users);
      },
      error => {
        console.log('Failed to get users: ', error);
      }
    );
  }

  handleRowClick(row) {
    console.log('handleRowClick passed: ', row);

  }

  handleCellClick(cell) {
    console.log('handleCellClick passed: ', cell);


  }

  removeUser(exUser: IUser) {
    const id = exUser.id;

    this.userService.delete(id).subscribe(
      result => { },
      error => { }
    );

  }

}
