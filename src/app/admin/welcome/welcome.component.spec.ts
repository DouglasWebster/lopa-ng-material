import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';

import { Observable } from 'rxjs/Observable';
import { Subscriber} from 'rxjs/Subscriber';

import { User } from '../../shared/models';
import { UserService } from '../../shared/services';

import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  const fakeUsers = '[{"firstName":"Micky","lastName":"Mouse","userName":"mMouse",'
    + '"password":"Password1","admin":true,"id":1},{"firstName":"Daffy","lastName":"Duck",'
    + '"userName":"dDuck","password":"Password2","admin":false,"id":2}]';

  const userServiceStub = {
    getAll(): Observable<String[]> {
      return new Observable<String[]>((subscriber: Subscriber<String[]>) => subscriber.next(JSON.parse(fakeUsers)));
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        RouterTestingModule
      ],
      declarations: [WelcomeComponent],
      providers: [
        { provide: UserService, useValue: userServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
