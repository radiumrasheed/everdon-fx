import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CommonModule } from '@angular/common';
import { MomentModule } from 'angular2-moment';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';


import { TransactionComponents, TransactionRoutingModule } from './transaction.routing';
import { HttpInterceptorProviders } from '../http-interceptors';
import { TransactionService } from './transaction.service';
import { SharedModule } from '../shared/shared.module';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		HttpClientModule,
		MomentModule,
		NgbModule,
		SharedModule,
		Ng2SmartTableModule,
		SweetAlert2Module,
		NgZorroAntdModule,

		TransactionRoutingModule
	],
	declarations: [
		TransactionComponents
	],
	providers: [
		TransactionService,
		HttpInterceptorProviders
	]
})
export class TransactionModule {
}
