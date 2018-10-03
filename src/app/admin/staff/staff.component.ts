import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../../currency/currency.service';
import { NzMessageService } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';
import { Product } from '../../shared/meta-data';
import { StaffService } from './staff.service';


@Component({
	selector: 'app-staff',
	templateUrl: './staff.component.html',
	styleUrls: ['./staff.component.css'],
	providers: [StaffService]
})
export class StaffComponent implements OnInit {

	pageSize = 10;
	total: number;
	pageIndex = 1;
	sortValue: string;
	sortKey: string;
	dataSet = [];
	editCache = {};
	formatterNaira = value => `₦ ${value}`;
	i = 1;
	loading = false;
	parserNaira = value => value.replace('₦ ', '');
	index1: number;


	constructor(private message: NzMessageService, private staffService: StaffService) {
	}


	ngOnInit(): void {
		this.getStaffs();
	}


	searchData(reset: boolean = false): void {
		if (reset) {
			this.pageIndex = 1;
		}

		this.getStaffs();
	}


	sort(sort: { key: string, value: string }): void {
		this.sortKey = sort.key;
		this.sortValue = sort.value;
		this.searchData();
	}


	startEdit(key: string): void {
		this.editCache[key].edit = true;
	}


	getStaffs(): void {
		this.loading = true;

		this.staffService.getStaffs({
			pageIndex: this.pageIndex,
			pageSize: this.pageSize,
			sortKey: this.sortKey,
			sortValue: this.sortValue
		})
			.pipe(finalize(() => {
				this.updateEditCache();
				this.loading = false;
			}))
			.subscribe(
				pagination => {
					this.dataSet = pagination.data;
					this.total = pagination.total;
				}
			)
	}


	updateStaff(staff: any) {
		this.loading = true;

		/*this.staffService.updateProduct(product.id, product)
			.pipe(finalize(() => this.loading = false))
			.subscribe(updated_staff => {
				if (updated_staff) {
					this.updateDataSet(updated_staff.id, updated_staff);
					this.message.success('Updated Successfully', {nzDuration: 10000});
				}
			})*/
	}


	cancelEdit(key: string): void {
		this.editCache[key].edit = false;
	}


	saveEdit(key: string): void {
		// this.updateStaff(this.editCache[key].data);
	}


	updateEditCache(): void {
		this.dataSet.forEach(item => {
			if (!this.editCache[item.id]) {
				this.editCache[item.id] = {
					edit: false,
					data: {...item}
				};
			}
		});
	}
}
