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


	private _transaction: Transaction;
	get transaction(): Transaction {
		return this._transaction;
	}


	@Input() set transaction(transaction: Transaction) {
		this._transaction = transaction;
		this.transactionChange.emit(transaction);
	}


	@ViewChild(`createCustomerSwal`) private createCustomerSwalComponent: SwalComponent;

	roles$: Observable<string>;

	@Output() transactionChange = new EventEmitter<Transaction>();

	@Input() role: string;

	/**
	 *  Link to profile relative to `transaction.client_id`
	 * */
	@Input() profileLink: any;

	@Output() submittedSuccessfully = new EventEmitter<string>();

	@Output() customerCreatedSuccessfully = new EventEmitter<boolean>();

	// Constants...
	countries = COUNTRIES;
	availableProducts = PRODUCTS;
	bankList = BANKS;
	transactionModes = TRANSACTION_MODES;
	transactionTypes = TRANSACTION_TYPES;

	// Form Properties...
	rates: any;
	model: any;
	form1 = true;
	form2 = false;
	form3 = false;
	newAccount = true;
	submitting = false;
	accounts: Account[];

	// Search Input Properties...
	searching = false;
	gettingClient = false;
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

				delete this.transaction.client;
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


	constructor(private transactionService: RequestTransactionFormService,
							private router: Router,
							private route: ActivatedRoute,
							private auth: AuthService,
							private toastr: ToastrService) {
	}


	ngOnInit() {
		// Get and apply Role if no Role
		if (!this.role) {
			try {
				this.roles$ = this.auth.roles;
				this.roles$.subscribe(roles => this.role = roles[0]);
			} catch (e) {
				console.error(e);
			}
		}

		// Initiate new Transaction and get Client's accounts if no Transaction
		if (!this.transaction) {
			this.transaction = new Transaction();
		} else {
			this.shouldGetRates();

			// Get accounts
			if (this.role === 'client') {
				this.getMyAccounts();
			} else if (this.transaction.client_id) {
				this.getAccounts(this.transaction.client_id);
			}
		}
	}


	// Get Clients Accounts...
	private getAccounts(client_id: any) {
		this.transactionService.getClientAccounts(client_id)
			.subscribe(
				accounts => {
					this.accounts = accounts;
					if (accounts.length > 0) {
						this.newAccount = false;
					}
				}
			);
	}


	protected goToForm3(): void {
		this.form1 = false;
		this.form2 = false;
		this.form3 = true;
	}


	protected goToForm2(): void {
		this.form1 = false;
		this.form2 = true;
		this.form3 = false;
	}


	protected goToForm1(): void {
		this.form1 = true;
		this.form2 = false;
		this.form3 = false;
	}


	// reset account
	resetAccounts() {
		delete this.transaction.account_id;
		delete this.transaction.account_name;
		delete this.transaction.account_number;
		delete this.transaction.bank_name;
		// delete this.transaction.bvn;
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


	// Get My Accounts if signed in as a client...
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


	// Get client details...
	getClient(id: string): void {
		this.gettingClient = true;
		this.transactionService.getClient(id)
			.subscribe(
				client => {
					this.transaction.client = client;
				},
				err => {
				},
				() => {
					this.gettingClient = false;
				}
			);
	}


	onSubmittedSuccessfully($event: any = null): void {
		this.createCustomerSwalComponent.nativeSwal.close();
		this.customerCreatedSuccessfully.emit(true);
	}


	getRates(): void {
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


	shouldGetRates($event: any = null): void {
		if (this.transaction.buying_product_id && this.transaction.selling_product_id) {
			this.getRates();
		}

		if (typeof this.transaction.buying_product_id !== 'undefined' && (this.transaction.buying_product_id === this.transaction.selling_product_id)) {
			this.transaction.transaction_type_id = '3';
		} else if (this.transaction.transaction_type_id === 4) {
			// this.transaction.transaction_type_id = '4';
		} else {
			delete this.transaction.transaction_type_id;
		}
	}


	applyRate(rates = this.rates): void {
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


	goToProfilePage(): void {
		if (this.profileLink) {
			this.router.navigate(this.profileLink).catch();
		}
	}


	onCountryChange($event: any = null): void {
		this.transaction.foreign = this.transaction.country !== 'Nigeria';
	}
}
