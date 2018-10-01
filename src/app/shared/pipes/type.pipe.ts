import { Pipe, PipeTransform } from '@angular/core';
import { GenericOption } from '../meta-data/genericOption';
import * as _ from 'lodash';
import { TRANSACTION_TYPES } from '../meta-data';


@Pipe({
	name: 'type'
})
export class TypePipe implements PipeTransform {
	selectedType: GenericOption;


	transform(value: any, args?: any): any {
		this.selectedType = _.find(TRANSACTION_TYPES, type => {
			return type.id === value;
		});

		if (!this.selectedType) {
			return '';
		}

		return this.selectedType.desc;
	}

}
