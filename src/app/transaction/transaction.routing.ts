import {Routes} from '@angular/router';
import {RequestTransactionComponent} from './request-transaction/request-transaction.component';

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
      }
    ]
  }
];


