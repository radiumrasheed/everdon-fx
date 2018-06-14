import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MomentModule} from 'angular2-moment';
import {Ng2SmartTableModule} from 'ng2-smart-table';


import {transactionComponents, TransactionRoutingModule} from './transaction.routing';
import {TransactionService} from './transaction.service';
import {SharedModule} from '../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MomentModule,
    NgbModule,
    SharedModule,
    Ng2SmartTableModule,

    TransactionRoutingModule
  ],
  declarations: [transactionComponents],
  providers: [TransactionService]
})
export class TransactionModule {
}
