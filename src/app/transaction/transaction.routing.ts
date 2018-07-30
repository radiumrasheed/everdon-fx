import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RequestTransactionComponent} from './request-transaction/request-transaction.component';
import {TransactionDetailsComponent} from './transaction-details/transaction-details.component';
import {ListTransactionsComponent} from './list-transactions/list-transactions.component';

export const TransactionRoutes: Routes = [
	{
		path: '',
		children: [
			{path: '', redirectTo: 'list', pathMatch: 'full'},
			{
				path: 'list',
				component: ListTransactionsComponent,
				data: {
					title: 'All Transactions',
					urls: [{title: 'Transaction', url: '../transaction'}, {title: 'All'}]
				}
			},
			{
				path: 'request',
				component: RequestTransactionComponent,
				data: {
					title: 'Request Transaction',
					urls: [{title: 'Transactions', url: '../transaction'}, {title: 'Request'}]
				}
			},
			{
				path: 'details/:id',
				component: TransactionDetailsComponent,
				data: {
					title: 'Transaction Details',
					urls: [{title: 'All Transactions', url: '../transaction'}, {title: 'Detailed'}]
				}
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(TransactionRoutes)],
	exports: [RouterModule]
})
export class TransactionRoutingModule {
}

export const TransactionComponents = [TransactionDetailsComponent, RequestTransactionComponent, ListTransactionsComponent];

