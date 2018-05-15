import {Routes} from '@angular/router';
import {RequestTransactionComponent} from './request-transaction/request-transaction.component';
import {TransactionDetailsComponent} from './transaction-details/transaction-details.component';

export const TransactionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'request',
        component: RequestTransactionComponent,
        data: {
          title: 'Request Transaction',
          urls: [{title: 'Transaction', url: '/transaction'}, {title: 'Request Transaction'}]
        }
      },
      {
        path: 'details',
        component: TransactionDetailsComponent,
        data: {
          title: 'Transaction Details',
          urls: [{title: 'Transaction', url: '/transaction'}, {title: 'Transaction Details'}]
        }
      }
    ]
  }
];


