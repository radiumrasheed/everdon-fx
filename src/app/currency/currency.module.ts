import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CurrencyRouting} from './currency.routing';
import {ListCurrenciesComponent} from './list-currencies/list-currencies.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';


@NgModule({
	imports: [
		CommonModule,
		CurrencyRouting,
		NgZorroAntdModule
	],
	declarations: [ListCurrenciesComponent]
})
export class CurrencyModule {
}
