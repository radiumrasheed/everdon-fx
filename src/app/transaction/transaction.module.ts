import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {transactionComponents, TransactionRoutingModule} from './transaction.routing';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MomentModule} from 'angular2-moment';

import {TransactionService} from './transaction.service';
import {ManageTransactionComponent} from './manage-transaction/manage-transaction.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MomentModule,
    NgbModule,

    TransactionRoutingModule
  ],
  declarations: [transactionComponents, ManageTransactionComponent],
  providers: [TransactionService]
})
export class TransactionModule {
}
