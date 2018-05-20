import {Pipe, PipeTransform} from '@angular/core';
import {GenericOption} from './generic-option';
import * as _ from 'lodash';


export const transactionTypes: GenericOption[] = [
  {id: 1, name: 'purchase', desc: 'Purchase'},
  {id: 2, name: 'sales', desc: 'In Sales'},
  {id: 3, name: 'swap', desc: 'Swap'},
  {id: 4, name: 'refund', desc: 'Refund'},
  {id: 5, name: 'expenses', desc: 'Expenses'},
];

@Pipe({
  name: 'type'
})
export class TypePipe implements PipeTransform {
  selectedType: GenericOption;


  transform(value: any, args?: any): any {
    this.selectedType = _.find(transactionTypes, type => {
      return type.id === value;
    });

    if (!this.selectedType) {
      return '';
    }

    return this.selectedType.desc;
  }

}
