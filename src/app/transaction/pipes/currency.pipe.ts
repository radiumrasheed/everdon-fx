import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';
import {Product, CURRENCIES} from '../transaction';

@Pipe({
  name: 'currency'
})
export class CurrencyPipe implements PipeTransform {
  selectedCurrency: Product;
  result: string;

  transform(value: any, args?: any): any {
    this.selectedCurrency = _.find(CURRENCIES, currency => {

      return currency.id === value;
    });


    switch (args) {
      case 'desc':
        this.result = this.selectedCurrency.desc;
        break;
      case 'sign':
        this.result = this.selectedCurrency.sign;
        break;
      default:
        this.result = this.selectedCurrency.name;
        break;
    }

    return this.result;
  }

}
