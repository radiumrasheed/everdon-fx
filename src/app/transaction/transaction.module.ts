import {NgModule, ViewContainerRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {transactionComponents, TransactionRoutingModule} from './transaction.routing';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MomentModule} from 'angular2-moment';

import {TransactionService} from './transaction.service';
import {StatusPipe} from './pipes/status.pipe';
import {TypePipe} from './pipes/type.pipe';
import {ModePipe} from './pipes/mode.pipe';
import {ManageTransactionComponent} from './manage-transaction/manage-transaction.component';
import {CurrencyPipe} from './pipes/currency.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MomentModule,
    NgbModule,

    TransactionRoutingModule
  ],
  declarations: [transactionComponents, StatusPipe, TypePipe, ModePipe, ManageTransactionComponent, CurrencyPipe],
  providers: [TransactionService]
})
export class TransactionModule {
}
