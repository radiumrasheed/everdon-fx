import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';

import { OrganizationService } from './organization.service';
import { BANKS } from '../../shared/meta-data';


export interface Organization {
	id: number;
	name?: string;
	bank_name?: string;
	account_name?: string;
	account_number?: string;
	checked?: boolean;
}


@Component({
	selector: 'app-organization',
	templateUrl: './organization.component.html',
	styleUrls: ['./organization.component.css'],
	providers: [OrganizationService]
})
export class OrganizationComponent implements OnInit {
	o = { loading: false, deleting: false };
	filterRoleList: string[] = [];
	allChecked = false;
	disabledButton = true;
	checkedNumber = 0;
	indeterminate = false;
	pageSize = 10;
	total: number;
	pageIndex = 1;
	sortValue = '';
	sortKey = '';
	dataSet = [];
	editCache = {};
	i = 1;
	bankList = BANKS;
	loading = false;
	tab_index = 2;
	displayData: Array<Organization> = [];
	validateForm: FormGroup;


	constructor(private message: NzMessageService, private organizationService: OrganizationService, private fb: FormBuilder, private notification: NzNotificationService) {

		this.validateForm = this.fb.group({
			name: ['', [Validators.required]],
			bank_name: [null, [Validators.required]],
			account_name: ['', [Validators.required]],
			account_number: ['', [Validators.required]]
		});
	}


	ngOnInit(): void {
		this.getOrganization();
	}


	private updateDataSet(key: string, data: any): void {
		const index = this.dataSet.findIndex(item => item.id === key);

		Object.assign(this.dataSet[index], data);
		Object.assign(this.editCache[key], data);

		this.editCache[key].edit = false;
		// this.o[key] = false;
	}


	private updateOrganization(organization: any) {
		this.o[organization.id] = true;

		this.organizationService.updateOrganization(organization.id, organization)
			.pipe(finalize(() => this.o[organization.id] = false))
			.subscribe(updated_organization => {
				if (updated_organization) {
					this.updateDataSet(updated_organization.id, updated_organization);
					this.message.success('Updated Successfully', { nzDuration: 10000 });
				}
			})
	}


	public submitForm($event, value) {
		this.loading = true;

		$event.preventDefault();
		for (const key in this.validateForm.controls) {
			if (key) {
				this.validateForm.controls[key].markAsDirty();
				this.validateForm.controls[key].updateValueAndValidity();
			}
		}

		this.organizationService.addOrganization(value)
			.pipe(finalize(() => this.loading = false))
			.subscribe(organization => {
				this.notification.create('success', 'Add Organization', `${organization.name} successfully created!`);
				this.resetForm();
			});
	};


	public resetForm(e?: MouseEvent): void {
		if (e) {
			e.preventDefault();
		}

		this.validateForm.reset();
		for (const key in this.validateForm.controls) {
			if (key) {
				this.validateForm.controls[key].markAsPristine();
				this.validateForm.controls[key].updateValueAndValidity();
			}
		}
	}


	public checkAll(value: boolean): void {
		this.displayData.forEach(data => data.checked = value);
		this.refreshStatus();
	}


	public currentPageDataChange($event: Array<Organization>): void {
		this.displayData = $event;
	}


	public refreshStatus(): void {
		const allChecked = this.displayData.every(value => value.checked === true);
		const allUnChecked = this.displayData.every(value => !value.checked);
		this.allChecked = allChecked;
		this.indeterminate = (!allChecked) && (!allUnChecked);
		this.disabledButton = !this.dataSet.some(value => value.checked);
		this.checkedNumber = this.dataSet.filter(value => value.checked).length;
	}


	public searchData(reset: boolean = false): void {

		this.refreshStatus();

		if (reset) {
			this.pageIndex = 1;
		}

		this.getOrganization();
	}


	public sort(sort: { key: string, value: string }): void {
		this.sortKey = sort.key;
		this.sortValue = sort.value === 'descend' ? 'desc' : 'asc';

		this.searchData();
	}


	public startEdit(key: string): void {
		this.editCache[key].edit = true;
	}


	public getOrganization(): void {
		this.o.loading = true;

		this.organizationService.getOrganization({
			pageIndex: this.pageIndex,
			pageSize: this.pageSize,
			sortField: this.sortKey,
			sortOrder: this.sortValue
			// add other filters below ...
		})
			.pipe(finalize(() => {
				this.o.loading = false;
			}))
			.subscribe(
				collection => {
					this.dataSet = collection.data;
					this.total = collection.total;
					this.updateEditCache();
				}
			)
	}


	public deleteOrganization(organization_id: number): void {
		this.o.deleting = true;
		this.organizationService.deleteOrganization(organization_id)
			.pipe(finalize(() => this.o.deleting = false))
			.subscribe(
				() => {
					_.remove(this.dataSet, organization => organization.id === organization_id);
					this.message.success('Organization deleted')
				}
			);
	}


	public cancelEdit(key: string): void {
		this.editCache[key].edit = false;
	}


	public saveEdit(key: string): void {
		this.updateOrganization(this.editCache[key].data);
	}


	public updateEditCache(): void {
		this.dataSet.forEach(item => {
			if (!this.editCache[item.id]) {
				this.editCache[item.id] = {
					edit: false,
					data: { ...item }
				};
			}
		});
	}


	public resetSort() {
		if (this.sortKey !== '' || this.sortValue !== '') {
			this.sortValue = this.sortKey = '';
			this.getOrganization();
		}
	}
}
