import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../../currency/currency.service';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';
import { Product } from '../../shared/meta-data';
import { StaffService } from './staff.service';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';


interface Staff {
	id: number;
	user_id: number;

	first_name?: string;
	middle_name?: string;
	last_name?: string;

	phone?: string;
	updated_at: string;

	name: string;
	age: number;
	address: string;
	checked: boolean
}


@Component({
	selector: 'app-staff',
	templateUrl: './staff.component.html',
	styleUrls: ['./staff.component.css'],
	providers: [StaffService]
})
export class StaffComponent implements OnInit {
	allChecked = false;
	disabledButton = true;
	checkedNumber = 0;
	indeterminate = false;
	pageSize = 10;
	total: number;
	pageIndex = 1;
	sortValue: string;
	sortKey: string;
	dataSet = [];
	editCache = {};
	i = 1;
	loading = false;
	tab_index: number;
	displayData: Array<Staff> = [];

	validateForm: FormGroup;

	submitForm = ($event, value) => {
		this.loading = true;

		$event.preventDefault();
		for (const key in this.validateForm.controls) {
			if (key) {
				this.validateForm.controls[key].markAsDirty();
				this.validateForm.controls[key].updateValueAndValidity();
			}
		}

		this.staffService.addStaff(value)
			.pipe(finalize(() => this.loading = false))
			.subscribe(staff => {
				this.notification.create('success', 'Add Staff', `${staff.user.roles[0].display_name} staff successfully created!`);
				this.resetForm();
			});
	};


	userNameAsyncValidator = (control: FormControl) => Observable.create((observer: Observer<ValidationErrors>) => {
		setTimeout(() => {
			if (control.value === 'JasonWood') {
				observer.next({error: true, duplicated: true});
			} else {
				observer.next(null);
			}
			observer.complete();
		}, 1000);
	});


	confirmValidator = (control: FormControl): { [s: string]: boolean } => {
		if (!control.value) {
			return {required: true};
		} else if (control.value !== this.validateForm.controls.password.value) {
			return {confirm: true, error: true};
		}
	};


	constructor(private message: NzMessageService, private staffService: StaffService, private fb: FormBuilder, private notification: NzNotificationService) {

		this.validateForm = this.fb.group({
			// userName: ['', [Validators.required], [this.userNameAsyncValidator]],
			email: ['', [Validators.email]],
			role: ['', [Validators.required]],
			first_name: ['', [Validators.required]],
			last_name: ['', [Validators.required]],
			gender: ['', [Validators.required]],
			phone: ['', [Validators.required]],
			password: ['', [Validators.required]],
			confirm: ['', [this.confirmValidator]]
		});
	}


	ngOnInit(): void {
		this.getStaffs();
	}


	public validateConfirmPassword(): void {
		setTimeout(() => this.validateForm.controls.confirm.updateValueAndValidity());
	}


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


	public currentPageDataChange($event: Array<Staff>): void {
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

		this.getStaffs();
	}


	public sort(sort: { key: string, value: string }): void {
		this.sortKey = sort.key;
		this.sortValue = sort.value;
		this.searchData();
	}


	public startEdit(key: string): void {
		this.editCache[key].edit = true;
	}


	public getStaffs(): void {
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


	public updateStaff(staff: any) {
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


	public cancelEdit(key: string): void {
		this.editCache[key].edit = false;
	}


	public saveEdit(key: string): void {
		// this.updateStaff(this.editCache[key].data);
	}


	public updateEditCache(): void {
		this.dataSet.forEach(item => {
			if (!this.editCache[item.id]) {
				this.editCache[item.id] = {
					edit: false,
					data: {...item}
				};
			}
		});
	}


	public resetFilters() {

	}


	public resetSortAndFilters() {

	}
}
