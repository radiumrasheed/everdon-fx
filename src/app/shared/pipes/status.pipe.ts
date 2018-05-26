import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';
import {GenericOption} from './generic-option';

export const transactionStatuses: GenericOption[] = [
  {id: 1, name: 'open', desc: 'Open', class: 'label-light-info'},
  {id: 2, name: 'in-progress', desc: 'In Progress', class: 'label-light-warning'},
  {id: 3, name: 'pending-approval', desc: 'Pending Approval', class: 'label-light-primary'},
  {id: 4, name: 'pending-fulfilment', desc: 'Pending Fulfilment', class: 'label-light-primary'},
  {id: 5, name: 'cancelled', desc: 'Cancelled', class: 'label-light-danger'},
  {id: 6, name: 'closed', desc: 'Closed', class: 'label-light-success'},
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
      case 'desc':
        this.result = this.selectedStatus.desc;
        break;
      default:
        this.result = this.selectedStatus.name;
        break;
    }

    return this.result;
  }
}
