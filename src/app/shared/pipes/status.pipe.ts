import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';
import {GenericOption, TRANSACTION_STATUSES} from '../meta-data';

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
