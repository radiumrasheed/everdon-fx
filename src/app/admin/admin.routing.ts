import {RouterModule, Routes} from '@angular/router';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {AdminComponent} from './admin.component';
import {CreateClientComponent} from './create-client/create-client.component';
import {ClientsComponent} from './clients/clients.component';
import {ViewClientComponent} from './view-client/view-client.component';
import {NgModule} from '@angular/core';
import {MeRoutes} from '../me/me.routing';

export const AdminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'transactions', redirectTo: 'transaction', pathMatch: 'full'},
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        data: {
          title: 'Dashboard',
          urls: [{title: 'Admin', url: '/admin'}, {title: 'Dashboard'}]
        }
      },
      {
        path: 'clients',
        component: ClientsComponent,
        data: {
          title: 'View Clients',
          urls: [{title: 'Admin', url: '/admin'}, {title: 'View Clients'}]
        }
      },
      {
        path: 'create_client',
        component: CreateClientComponent,
        data: {
          title: 'Dashboard',
          urls: [{title: 'Admin', url: '/admin'}, {title: 'Create Client'}]
        }
      },
      {
        path: 'client/:id',
        component: ViewClientComponent,
        data: {
          title: 'Dashboard',
          urls: [{title: 'Admin', url: '/admin'}, {title: 'View Client'}]
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


@NgModule({
  imports: [
    RouterModule.forChild(AdminRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: []
})
export class AdminRoutingModule {
}



