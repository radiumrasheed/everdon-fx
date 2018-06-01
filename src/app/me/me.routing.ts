import {RouterModule, Routes} from '@angular/router';
import {DashbaordComponent} from './dashbaord/dashbaord.component';
import {ProfileComponent} from './profile/profile.component';
import {MeComponent} from './me.component';
import {NgModule} from '@angular/core';

export const MeRoutes: Routes = [
  {
    path: '',
    component: MeComponent,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {
        path: 'dashboard',
        component: DashbaordComponent,
        data: {
          title: 'Dashboard',
          urls: [{title: 'Me', url: '/me'}, {title: 'Dashboard'}]
        }
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: {
          title: 'Profile',
          urls: [{title: 'Me', url: '/me'}, {title: 'Profile'}]
        }
      },
      {path: 'transactions', redirectTo: 'transaction', pathMatch: 'full'},
      {
        path: 'transaction',
        loadChildren: '../transaction/transaction.module#TransactionModule',
        data: {
          title: 'Transactions',
          urls: [{title: 'Me', url: '/me'}, {title: 'Transactions'}]
        }
      },
    ]
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(MeRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: []
})
export class MeRoutingModule {
}
