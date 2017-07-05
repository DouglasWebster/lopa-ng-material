import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminModule } from './admin/admin.module';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: '**', redirectTo: '/welcome', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [
    RouterModule,
    AdminModule
  ]
})
export class AppRoutingModule { }
