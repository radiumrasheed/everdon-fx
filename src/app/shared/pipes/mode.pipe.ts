import { Pipe, PipeTransform } from '@angular/core';
import { GenericOption } from '../meta-data/genericOption';
import * as _ from 'lodash';
import { TRANSACTION_MODES } from '../meta-data';


@Pipe({
	name: 'mode'
})
export class ModePipe implements PipeTransform {
	selectedMode: GenericOption;


	transform(value: any, args?: any): any {
		this.selectedMode = _.find(TRANSACTION_MODES, mode => {
			return mode.id === value;
		});

		if (!this.selectedMode) {
			return '';
		}

		return this.selectedMode.desc;
	}

}
