import {Routes} from '@angular/router';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {AdminComponent} from './admin.component';

export const AdminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {path: '', redirectTo: '/admin/dashboard', pathMatch: 'full'},
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        data: {
          title: 'Dashboard',
          urls: [{title: 'Admin', url: '/admin'}, {title: 'Dashboard'}]
        }
      },
      {
        path: 'transaction',
        loadChildren: '../transaction/transaction.module#TransactionModule',
        data: {
          title: 'Transactions',
          urls: [{title: 'Admin', url: '/admin'}, {title: 'Transactions'}]
        }
      }
    ]
  }
];


