import {Pipe, PipeTransform} from '@angular/core';
import {GenericOption} from './generic-option';
import * as _ from 'lodash';


export const transactionModes: GenericOption[] = [
  {id: 1, name: 'cash', desc: 'Cash'},
  {id: 2, name: 'transfer', desc: 'Transfer'},
  {id: 3, name: 'offshore', desc: 'Offshore'},
];

@Pipe({
  name: 'mode'
})
export class ModePipe implements PipeTransform {
  selectedMode: GenericOption;

  transform(value: any, args?: any): any {
    this.selectedMode = _.find(transactionModes, mode => {
      return mode.id === value;
    });

    if (!this.selectedMode) {
      return '';
    }

    return this.selectedMode.desc;
  }

}
