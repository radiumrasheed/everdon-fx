import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

export const CurrencyRoutes: Routes = [
	{}
];


@NgModule({
	imports: [RouterModule.forChild(CurrencyRoutes)],
	exports: [RouterModule]
})
export class CurrencyRouting {
}
