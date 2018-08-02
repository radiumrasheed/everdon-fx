import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, merge, switchMap, tap} from 'rxjs/operators';

import {User} from '../../authentication/login/user';
import {Account, BANKS, Client, COUNTRIES, PRODUCTS, Transaction, TRANSACTION_MODES, TRANSACTION_TYPES} from '../meta-data';
import {AuthService} from '../../services/auth/auth.service';
import {RequestTransactionFormService} from './request-transaction-form.service';
import {SwalComponent} from '@toverux/ngx-sweetalert2';

@Component({
	selector: 'app-request-transaction-form',
	templateUrl: './request-transaction-form.component.html',
	styleUrls: ['./request-transaction-form.component.css'],
	providers: [RequestTransactionFormService]
})
export class RequestTransactionFormComponent implements OnInit {
	roles$: Observable<string>;
	@Output() transactionChange = new EventEmitter<Transaction>();

	@Input() role: string;
	/**
	 *  Link to profile relative to `transaction.client_id`
	 * */
	@Input() profileLink: any;
	@Output() submittedSuccessfully = new EventEmitter<string>();
	@Output() customerCreatedSuccessfully = new EventEmitter<boolean>();
	searching = false;

	public client: Client;
	public gettingClient: boolean;

	// Constants...
	public countries = COUNTRIES;
	public availableProducts = PRODUCTS;
	public bankList = BANKS;
	public transactionModes = TRANSACTION_MODES;
	public transactionTypes = TRANSACTION_TYPES;
	// Form Properties...
	public rates: any;
	public model: any;
	public form1 = true;
	public form2 = false;
	public form3 = false;
	public newAccount = true;
	public submitting = false;
	public accounts: Account[];
	searchEmpty = false;
	searchFailed = false;
	hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);
	search = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			tap(() => this.searching = true),
			switchMap(term => {
					if (term === '' || term.length < 3) {
						return of([]);
					}

					delete this.client;
					return this.transactionService.searchClients(term)
						.pipe(
							tap(result => {
								this.searchFailed = false;
								this.searchEmpty = result.length < 1;
							}),
							catchError(() => {
								this.searchFailed = true;
								return of([]);
							})
						);
				}
			),
			tap(() => this.searching = false),
			merge(this.hideSearchingWhenUnsubscribed)
		);
	updateModel = (event: any) => {
		this.getClient(event.item.id);
		this.getAccounts(event.item.id);
		this.transaction.client_id = event.item.id;
	};
	formatter = (user: User) => user.first_name + ' ' + user.last_name + ' -- ' + user.email;
	@ViewChild(`createCustomerSwal`) private createCustomerSwalComponent: SwalComponent;

	constructor(private transactionService: RequestTransactionFormService,
	            private router: Router,
	            private route: ActivatedRoute,
	            private auth: AuthService,
	            private toastr: ToastrService) {
	}

	private _transaction: Transaction;

	get transaction(): Transaction {
		return this._transaction;
	}

	@Input() set transaction(transaction: Transaction) {
		this._transaction = transaction;
		this.transactionChange.emit(transaction);
	}

	// reset account
	resetAccounts() {
		delete this.transaction.account_id;
		delete this.transaction.account_name;
		delete this.transaction.account_number;
		delete this.transaction.bank_name;
		// delete this.transaction.bvn;
	}

	ngOnInit() {
		if (!this.role) {
			try {
				this.roles$ = this.auth.roles;
				this.roles$.subscribe(roles => this.role = roles[0]);
			} catch (e) {
				console.error(e);
			}
		}

		if (!this.transaction) {
			this.transaction = new Transaction();
		} else {
			this.shouldGetRates();
		}

		this.getMyAccounts();
	}

	// Submit a transaction Request...
	requestTransaction(): void {
		if (this.role !== 'client' && this.role !== 'fx-ops') {
			this.toastr.error('You\'re not eligible to make this request! Please refer to FX-Ops Member');
			return;
		}

		this.submitting = true;
		this.transactionService.requestTransaction(this.transaction)
			.subscribe(
				_transaction => {
					if (_transaction) {
						const id = _transaction.id + '';

						this.transaction = new Transaction();
						this.toastr.success('Transaction Request sent successfully');
						this.submittedSuccessfully.emit(id);

					}
				},
				() => {

				}, () => {
					this.submitting = false;
				}
			);
	}

	getMyAccounts(): void {
		this.transactionService.getAccounts()
			.subscribe(
				accounts => {
					if (accounts) {
						this.accounts = accounts;
						if (accounts.length > 0) {
							this.newAccount = false;
						}
					}
				}
			);
	}

	getClient(id: string): void {
		this.gettingClient = true;
		this.transactionService.getClient(id)
			.subscribe(
				client => {
					this.client = client;
				},
				err => {
				},
				() => {
					this.gettingClient = false;
				}
			);
	}

	goToForm3() {
		this.form1 = false;
		this.form2 = false;
		this.form3 = true;
	}

	goToForm2() {
		this.form1 = false;
		this.form2 = true;
		this.form3 = false;
	}

	goToForm1() {
		this.form1 = true;
		this.form2 = false;
		this.form3 = false;
	}

	public onSubmittedSuccessfully($event: any) {
		this.createCustomerSwalComponent.nativeSwal.close();
		this.customerCreatedSuccessfully.emit(true);
	}

	getRates() {
		this.transactionService.getAllRates()
			.subscribe(
				rates => {
					if (rates) {
						this.rates = rates;
						this.applyRate(rates);
					}
				},
				() => {
				},
				() => {
				}
			);
	}

	shouldGetRates($event = null) {
		if (this.transaction.buying_product_id && this.transaction.selling_product_id) {
			this.getRates();
		}

		if (typeof this.transaction.buying_product_id !== 'undefined' && (this.transaction.buying_product_id === this.transaction.selling_product_id)) {
			this.transaction.transaction_type_id = '3';
		} else {
			delete this.transaction.transaction_type_id;
		}
	}

	applyRate(rates = this.rates) {
		const b = this.transaction.buying_product_id;
		const s = this.transaction.selling_product_id;

		if (rates) {
			try {
				this.transaction.rate = (rates[b - 1]['rate'] / rates[s - 1]['rate']).toFixed(4);
			} catch (e) {
				console.error(e);
			}
		}
	}

	goToProfilePage() {
		if (this.profileLink) {
			this.router.navigate(this.profileLink).catch();
		}
	}

	// Get Clients Accounts...
	private getAccounts(client_id: any) {
		this.transactionService.getClientAccounts(client_id)
			.subscribe(
				accounts => {
					this.accounts = accounts;
				}
			);
	}

	onCountryChange($event = null) {
		this.transaction.foreign = this.transaction.country !== 'Nigeria';
	}
}
