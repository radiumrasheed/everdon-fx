import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminComponent } from './admin.component';
import { CreateClientComponent } from './create-client/create-client.component';
import { ClientsComponent } from './clients/clients.component';
import { ViewClientComponent } from './view-client/view-client.component';
import { NgModule } from '@angular/core';
import { StaffComponent } from './staff/staff.component';
import { OrganizationComponent } from './organization/organization.component';

export const AdminRoutes: Routes = [
	{
		path: '',
		component: AdminComponent,
		children: [
			{path: '', redirectTo: 'dashboard', pathMatch: 'full'},

			{path: 'transactions', redirectTo: 'transaction', pathMatch: 'full'},
			{
				path: 'transaction',
				loadChildren: '../transaction/transaction.module#TransactionModule',
				data: {
					title: 'Transactions',
					urls: [{title: 'Admin', url: '/admin'}, {title: 'Transactions'}]
				}
			},

			{
				path: 'dashboard',
				component: AdminDashboardComponent,
				data: {
					title: 'Dashboard',
					urls: [{title: 'Admin', url: '/admin'}, {title: 'Dashboard'}]
				}
			},

			{path: 'customers', redirectTo: 'customer', pathMatch: 'full'},
			{
				path: 'customer/list',
				component: ClientsComponent,
				data: {
					title: 'View Customers',
					urls: [{title: 'Admin', url: '/admin'}, {title: 'View Customers'}]
				}
			},
			{path: 'create_customer', redirectTo: 'customer/create', pathMatch: 'full'},
			{
				path: 'customer/create',
				component: CreateClientComponent,
				data: {
					title: 'Create Customer',
					urls: [{title: 'Admin', url: '/admin'}, {title: 'Create Customer'}]
				}
			},
			{
				path: 'customer/:id',
				component: ViewClientComponent,
				data: {
					title: 'View Customer',
					urls: [{title: 'Admin', url: '/admin'}, {title: 'View Customer'}]
				}
			},

			{
				path: 'currencies',
				loadChildren: '../currency/currency.module#CurrencyModule',
				data: {
					title: 'Currencies',
					urls: [{title: 'Admin', url: '/admin'}, {title: 'Currencies'}]
				}
			},


			{
				path: 'staffs',
				component: StaffComponent,
				data: {
					title: 'Staff',
					urls: [{ title: 'Staff', url: '/admin' }, { title: 'Staff' }]
				}
			},


			{
				path: 'organizations',
				component: OrganizationComponent,
				data: {
					title: 'Organization',
					urls: [{ title: 'organization', url: '/admin' }, { title: 'Organization' }]
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



