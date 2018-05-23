import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';
import {GenericOption} from './generic-option';

export const transactionStatuses: GenericOption[] = [
  {id: 1, name: 'open', desc: 'Open', class: 'label-primary'},
  {id: 2, name: 'in-progress', desc: 'In Progress', class: 'label-warning'},
  {id: 3, name: 'pending-approval', desc: 'Pending Approval', class: 'label-info'},
  {id: 4, name: 'pending-fulfilment', desc: 'Pending Fulfilment', class: 'label-success'},
  {id: 5, name: 'cancelled', desc: 'Cancelled', class: 'label-danger'},
  {id: 6, name: 'closed', desc: 'Closed', class: 'label-danger'},
  {id: 7, name: 'raised', desc: 'Raised', class: ''},
];

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {
  selectedStatus: GenericOption;
  result: string;

  transform(value: any, args?: any): any {
    this.selectedStatus = _.find(transactionStatuses, status => {
      return status.id === value;
    });


    switch (args) {
      case 'id':
        this.result = this.selectedStatus.id + '';
        break;
      case 'class':
        this.result = this.selectedStatus.class;
        break;
      default:
        this.result = this.selectedStatus.name;
        break;
    }

    return this.result;
  }
}
