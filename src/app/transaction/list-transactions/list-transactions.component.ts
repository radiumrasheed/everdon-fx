import * as _ from 'lodash';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CalendarPipe} from 'angular2-moment';
import {Observable} from 'rxjs';

import {TransactionService} from '../transaction.service';
import {AuthService} from '../../services/auth/auth.service';
import {ProductPipe} from '../../shared/pipes/product.pipe';
import {TypePipe} from '../../shared/pipes/type.pipe';
import {StatusPipe} from '../../shared/pipes/status.pipe';
import {PRODUCTS, Transaction, TRANSACTION_STATUSES, TRANSACTION_TYPES} from '../../shared/meta-data';


@Component({
	selector: 'app-list-transactions',
	templateUrl: './list-transactions.component.html',
	styleUrls: ['./list-transactions.component.css'],
	providers: [ProductPipe, CalendarPipe, StatusPipe, TypePipe]
})
export class ListTransactionsComponent implements OnInit {
	transactions: Transaction[];

	/* Smart table... */

	// Filter Settings...
	filterProductSettings = {
		type: 'list',
		config: {
			selectText: 'select..',
			list: _.map(PRODUCTS, _.partial(_.pick, _, ['id', 'name'])).map(({id, name}) => ({value: id, title: name}))
		}
	};
	filterStatusSettings = {
		type: 'list',
		config: {
			selectText: 'select..',
			list: _.map(TRANSACTION_STATUSES, _.partial(_.pick, _, ['id', 'desc'])).map(({id, desc}) => ({value: id, title: desc}))
		}
	};
	filterTypeSettings = {
		type: 'list',
		config: {
			selectText: 'select..',
			list: _.map(TRANSACTION_TYPES, _.partial(_.pick, _, ['id', 'desc'])).map(({id, desc}) => ({value: id, title: desc}))
		}
	};

	// Client Settings...
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

	// Admin Settings...
	admin_table_settings = {
		columns: {
			full_name: {
				title: 'Client Name',
				filter: true
			},
			link: {
				title: 'Transaction Reference',
				filter: true,
				type: 'html'
			},
			selling_product_id: {
				title: 'Selling',
				filter: this.filterProductSettings,
				valuePrepareFunction: (val) => {
					return this.productPipe.transform(val);
				}
			},
			buying_product_id: {
				title: 'Buying',
				filter: this.filterProductSettings,
				valuePrepareFunction: (val) => {
					return this.productPipe.transform(val);
				}
			},
			amount: {
				title: 'Amount',
				filter: true
			},
			transaction_type_id: {
				title: 'Type',
				valuePrepareFunction: (val) => {
					return this.typePipe.transform(val);
				},
				filter: this.filterTypeSettings
			},
			transaction_status_id: {
				title: 'Status',
				valuePrepareFunction: (val) => {
					return this.statusPipe.transform(val);
				},
				filter: this.filterStatusSettings
			},
			referrer: {
				title: 'Referrer',
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

	roles$: Observable<any>;
	role$: Observable<any>;


	// Class Constructor...
	constructor(private transactionService: TransactionService,
							private authService: AuthService,
							private calendarPipe: CalendarPipe,
							private statusPipe: StatusPipe,
							private productPipe: ProductPipe,
							private typePipe: TypePipe,
							private route: ActivatedRoute) {
	}


	// OnInit Method...
	ngOnInit() {
		this.roles$ = this.authService.roles;
		this.role$ = this.authService.role;
		this.getTransactions();
	}


	// Get the transactions and format them for viewing...
	getTransactions(): void {
		this.transactionService.getTransactions()
			.subscribe(
				transactions => {
					this.role$.subscribe(
						value => {
							const module = value === 'admin' ? 'admin' : 'me';
							this.transactions = transactions.map<Transaction>(transaction => {
								transaction.link = `<a href="/#/${module}/transaction/details/${transaction.id}">#${transaction.transaction_ref}</a>`;
								transaction.full_name = transaction.client.first_name + ' ' + transaction.client.last_name;
								return transaction;
							});
						}
					);
				}
			);
	}

}
