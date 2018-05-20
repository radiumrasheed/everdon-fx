import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';
import {GenericOption} from './generic-option';

export const transactionStatuses: GenericOption[] = [
  {id: 1, name: 'open', desc: 'Open'},
  {id: 2, name: 'in-progress', desc: 'In Progress'},
  {id: 3, name: 'pending-approval', desc: 'Pending Approval'},
  {id: 4, name: 'pending-fulfilment', desc: 'Pending Fulfilment'},
  {id: 5, name: 'cancelled', desc: 'Cancelled'},
  {id: 6, name: 'closed', desc: 'Closed'},
  {id: 7, name: 'raised', desc: 'Raised'},
];

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {
  selectedStatus: GenericOption;

  transform(value: any, args?: any): any {
    this.selectedStatus = _.find(transactionStatuses, status => {
      return status.id === value;
    });

    if (!this.selectedStatus) {
      return '';
    }

    return this.selectedStatus.desc;
  }
}
