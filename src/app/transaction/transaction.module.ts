import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MomentModule} from 'angular2-moment';
import {Ng2SmartTableModule} from 'ng2-smart-table';


import {TransactionComponents, TransactionRoutingModule} from './transaction.routing';
import {TransactionService} from './transaction.service';
import {SharedModule} from '../shared/shared.module';
import {HttpInterceptorProviders} from '../http-interceptors';
import {HttpClientModule} from '@angular/common/http';
import {UiSwitchModule} from 'ngx-ui-switch';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		HttpClientModule,
		MomentModule,
		NgbModule,
		SharedModule,
		Ng2SmartTableModule,
		UiSwitchModule,

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
