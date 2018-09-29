import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ListCurrenciesComponent} from './list-currencies/list-currencies.component';

export const CurrencyRoutes: Routes = [
	{
		path: '',
		children: [
			{path: '', redirectTo: 'list', pathMatch: 'full'},
			{
				path: 'list',
				component: ListCurrenciesComponent,
				data: {
					title: 'All Currencies',
					urls: [{title: 'Currency', url: '../currency'}, {title: 'All'}]
				}
			}
		]
	}
];


@NgModule({
	imports: [RouterModule.forChild(CurrencyRoutes)],
	exports: [RouterModule]
})
export class CurrencyRouting {
}
