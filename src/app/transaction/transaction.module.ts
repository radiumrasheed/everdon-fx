import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RequestTransactionComponent} from './request-transaction/request-transaction.component';
import {RouterModule} from '@angular/router';
import {TransactionRoutes} from './transaction.routing';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TransactionRoutes),
    FormsModule
  ],
  declarations: [
    RequestTransactionComponent
  ]
})
export class TransactionModule {
}
