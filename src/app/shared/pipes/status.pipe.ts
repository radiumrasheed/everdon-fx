import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';
import {GenericOption} from './generic-option';

export const TRANSACTION_STATUSES: GenericOption[] = [
  {id: 1, name: 'open', desc: 'Open', class: 'label-light-info'},
  {id: 2, name: 'in-progress', desc: 'In Progress', class: 'label-light-warning'},
  {id: 3, name: 'pending-approval', desc: 'Pending Approval', class: 'label-light-primary'},
  {id: 4, name: 'pending-fulfilment', desc: 'Pending Fulfilment', class: 'label-light-primary'},
  {id: 5, name: 'cancelled', desc: 'Cancelled', class: 'label-light-danger'},
  {id: 6, name: 'closed', desc: 'Closed', class: 'label-light-success'},
  {id: 7, name: 'raised', desc: 'Raised', class: ''},
  {id: 8, name: 'processing', desc: 'Your exchange is being processed', class: 'label-light-warning'},
  {id: 9, name: 'completed', desc: 'Success! Your exchange is complete', class: 'label-light-green'}
];

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {
  selectedStatus: GenericOption;
  result: string;

  transform(value: any, ...args): any {
    const [kind, user, ...rest] = args;

    this.selectedStatus = _.find(TRANSACTION_STATUSES, status => {
      switch (user) {
        case 'client':
          if (status.id in [1, 2, 3, 4, 7]) {
            value = 8;
          } else if (status.id in [6]) {
            value = 9;
          }
          break;
        default:

          break;
      }

      return status.id === value;
    });


    switch (kind) {
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
