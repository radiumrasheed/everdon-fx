import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {TransactionRoutes} from './transaction.routing';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {RequestTransactionComponent} from './request-transaction/request-transaction.component';
import {TransactionDetailsComponent} from './transaction-details/transaction-details.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TransactionRoutes),
    FormsModule,
    NgbModule
  ],
  declarations: [
    RequestTransactionComponent,
    TransactionDetailsComponent
  ]
})
export class TransactionModule {
}
