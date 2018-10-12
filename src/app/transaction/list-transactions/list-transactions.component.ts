import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarPipe } from 'angular2-moment';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';


import { PRODUCTS, Transaction, TRANSACTION_STATUSES, TRANSACTION_TYPES } from '../../shared/meta-data';
import { AuthService } from '../../services/auth/auth.service';
import { ProductPipe } from '../../shared/pipes/product.pipe';
import { TransactionService } from '../transaction.service';
import { StatusPipe } from '../../shared/pipes/status.pipe';
import { SwalComponent } from '@toverux/ngx-sweetalert2';
import { TypePipe } from '../../shared/pipes/type.pipe';
import { finalize } from 'rxjs/operators';


@Component({
	selector: 'app-list-transactions',
	templateUrl: './list-transactions.component.html',
	styleUrls: ['./list-transactions.component.css'],
	providers: [ProductPipe, CalendarPipe, StatusPipe, TypePipe]
})
export class ListTransactionsComponent implements OnInit {
	@ViewChild(`requestSwal`) private requestSwalComponent: SwalComponent;

	module: string;
	tabIndex = 0;
	o = {};
	filterCreatedAtList: string[] = [moment().day(-26).startOf('day').format(), moment().endOf('day').format()];
	filterTypeList: string[] = _.map(TRANSACTION_TYPES, _.partial(_.pick, _, ['id'])).map(({ id }) => (id));
	filterStatusList: string[] = _.map(_.filter(TRANSACTION_STATUSES, 'show'), _.partial(_.pick, _, ['id'])).map(({ id }) => (id));
	pageSize = 10;
	total: number;
	pageIndex = 1;
	sortValue = '';
	sortKey = '';
	dataSet = [];

	displayData: Array<Transaction> = [];
	filterStatus = _.map(_.filter(TRANSACTION_STATUSES, 'show'), _.partial(_.pick, _, ['id', 'desc'])).map(({ id, desc }) => ({ value: id, text: desc, byDefault: true }));
	filterType = _.map(TRANSACTION_TYPES, _.partial(_.pick, _, ['id', 'desc'])).map(({ id, desc }) => ({ value: id, text: desc, byDefault: true }));

	dateRangePresets = {
		'Today': [moment().startOf('day').format(), moment().endOf('day').format()],
		'Last 7 days': [moment().day(-3).startOf('day').format(), moment().endOf('day').format()],
		'Last 30 days': [moment().day(-26).startOf('day').format(), moment().endOf('day').format()],
		'This Week': [moment().startOf('week').format(), moment().endOf('week').format()],
		'This Month': [moment().startOf('month').format(), moment().endOf('month').format()]
	};

	filterProductSettings = {
		type: 'list',
		config: {
			selectText: 'select..',
			list: _.map(PRODUCTS, _.partial(_.pick, _, ['id', 'name'])).map(({ id, name }) => ({ value: id, title: name }))
		}
	};
	client_table_settings = {
		columns: {
			link: {
				title: 'Transaction Reference',
				filter: true,
				type: 'html'
			},
			buying_product_id: {
				title: 'Buying',
				filter: this.filterProductSettings,
				valuePrepareFunction: (val) => {
					return this.productPipe.transform(val);
				}
			},
			selling_product_id: {
				title: 'Selling',
				filter: this.filterProductSettings,
				valuePrepareFunction: (val) => {
					return this.productPipe.transform(val);
				}
			},
			/*transaction_status_id: {
				title: 'Status',
				valuePrepareFunction: (val) => {
					return this.statusPipe.transform(val);
				},
				filter: true,
			},*/
			amount: {
				title: 'Amount',
				filter: true
			},
			created_at: {
				title: 'Time Requested',
				filter: true,
				valuePrepareFunction: (val) => {
					return this.calendarPipe.transform(val);
				}
			}
		},
		noDataMessage: 'No transactions',
		actions: {
			add: false,
			edit: false,
			delete: false,
			columnTitle: ''
		}
	};

	role: string;
	role$: Observable<any>;
	roles$: Observable<any>;
	transactions: Transaction[];


	// Class Constructor...
	constructor(private transactionService: TransactionService,
							private authService: AuthService,
							private calendarPipe: CalendarPipe,
							private statusPipe: StatusPipe,
							private productPipe: ProductPipe,
							private typePipe: TypePipe,
							private router: Router) {
	}


	// OnInit Method...
	ngOnInit() {
		this.roles$ = this.authService.roles;
		this.role$ = this.authService.role;
		this.roles$.subscribe(roles => {
			this.role = roles[0];
			this.module = roles === 'admin' ? 'admin' : 'me';
		});

		this.getTransactions();
		this.getPaginatedTransactions();
	}


	// Get the transactions and format them for viewing...
	public getTransactions(): void {
		this.transactionService.getTransactions()
			.subscribe(
				transactions => {
					this.transactions = transactions.map<Transaction>(transaction => {
							transaction.link = `<a href="/#/${this.module}/transaction/details/${transaction.id}">#${transaction.transaction_ref}</a>`;
							transaction.full_name = transaction.client.first_name + ' ' + transaction.client.last_name;
							return transaction;
						}
					);
				}
			);
	}


	// Get the transactions and format them for viewing...
	public getPaginatedTransactions(): void {
		this.o['loading'] = true;
		this.transactionService.getPaginatedTransactions({
			pageIndex: this.pageIndex,
			pageSize: this.pageSize,
			sortField: this.sortKey,
			sortOrder: this.sortValue,
			// add other filters below ...
			status: this.filterStatusList,
			type: this.filterTypeList,
			created_at: this.filterCreatedAtList
		})
			.pipe(
				finalize(() => this.o['loading'] = false)
			)
			.subscribe(
				collection => {
					this.dataSet = collection.data;
					this.total = collection.total;
				}
			);
	}


	// Filter Methods...

	public updateStatusFilter(value: string[]): void {
		this.filterStatusList = value;
		this.searchData(true);
	}


	public updateTypeFilter(value: string[]): void {
		this.filterTypeList = value;
		this.searchData(true);
	}


	public updateDateRangeFilter($event) {
		this.filterCreatedAtList = [moment($event[0]).format(), moment($event[1]).format()];
		this.getPaginatedTransactions();
	}


	// Sort Methods...

	public sort(sort: { key: string, value: string }): void {
		this.sortKey = sort.key;
		this.sortValue = sort.value === 'descend' ? 'desc' : 'asc';

		this.searchData();
	}


	public searchData(reset: boolean = false): void {
		if (reset) {
			this.pageIndex = 1;
		}

		this.getPaginatedTransactions();
	}


	// Reset Methods...

	public resetSortAndFilter(): void {
		this.sortValue = this.sortKey = '';

		this.filterCreatedAtList = [moment().day(-26).startOf('day').format(), moment().endOf('day').format()];
		this.filterTypeList = _.map(TRANSACTION_TYPES, _.partial(_.pick, _, ['id'])).map(({ id }) => (id));
		this.filterStatusList = _.map(_.filter(TRANSACTION_STATUSES, 'show'), _.partial(_.pick, _, ['id'])).map(({ id }) => (id));

		this.searchData(true);
	}


	public currentPageDataChange($event: Array<Transaction>): void {
		this.displayData = $event;
	}


	// For request transaction...
	public onRequestSuccessful($event: any, type: string) {
		switch (type) {
			case 'request':
				this.requestSwalComponent.nativeSwal.close();

				// Navigate to the newly requested transaction...
				this.router.navigate(['/admin', 'dashboard']).catch(err => console.error(err, $event));
				break;

			case 'customer-created':
				this.requestSwalComponent.show().catch();
				break;

			default:
			// Do Nothing...
		}
	}
}
