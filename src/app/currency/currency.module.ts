import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyRouting } from './currency.routing';
import { ListCurrenciesComponent } from './list-currencies/list-currencies.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';
import { SharedModule } from '../shared/shared.module';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		// MomentModule,
		SharedModule,
		CurrencyRouting,
		NgZorroAntdModule
	],
	declarations: [ListCurrenciesComponent]
})
export class CurrencyModule {
}
