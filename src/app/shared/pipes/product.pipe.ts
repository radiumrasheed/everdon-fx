import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';
import {Product, PRODUCTS} from '../meta-data';

@Pipe({
  name: 'currency'
})
export class ProductPipe implements PipeTransform {
  selectedCurrency: Product;
  result: string;

  transform(value: any, args?: any): any {
    this.selectedCurrency = _.find(PRODUCTS, currency => {
      if (typeof value === 'string') {
        return currency.id === parseInt(value, null);
      }
      return currency.id === value;
    });


    switch (args) {
      case 'desc':
        this.result = this.selectedCurrency.description;
        break;
      case 'sign':
        this.result = this.selectedCurrency.sign;
        break;
      case 'value':
        this.result = this.selectedCurrency.value;
        break;
      default:
        this.result = this.selectedCurrency.name;
        break;
    }

    return this.result;
  }

}
