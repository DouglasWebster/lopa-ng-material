import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomeComponent } from './welcome/welcome.component';
import { UsersComponent } from './users/users.component';

import { AdminGuard } from '../shared/guards/admin.guard';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent},
  { path: 'users', canActivate: [AdminGuard], component: UsersComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
