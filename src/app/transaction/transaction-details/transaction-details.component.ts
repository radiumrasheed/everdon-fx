import {Component, OnInit, ViewChild} from '@angular/core';
import {TransactionService} from '../transaction.service';
import {ORGANIZATIONS, PRODUCTS, Transaction} from '../../shared/meta-data';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../../services/auth/auth.service';
import {ToastrService} from 'ngx-toastr';
import {RefundTransaction} from '../../shared/meta-data/transaction';
import {SwalComponent} from '@toverux/ngx-sweetalert2';


@Component({
	selector: 'app-transaction-details',
	templateUrl: './transaction-details.component.html',
	styleUrls: ['./transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit {

	private can_be_updated = false;
	@ViewChild(`refundSwal`) private refundSwalComponent: SwalComponent;
	can_approve = false;
	can_be_approved = false;
	can_be_cancelled = true;
	can_be_fulfilled = false;
	can_be_returned = true;
	can_be_treated = false;
	can_fulfil = false;
	can_modify_aml_kyc = false;
	can_modify_condition = false;
	can_modify_funds_check = false;
	can_modify_org = false;
	can_modify_rate = false;
	can_modify_swap_charges = false;
	can_take_action = false;
	can_treat = false;
	currencyList = PRODUCTS;
	id: string;
	is_client: boolean;
	nextActionText: string;
	nextSubmitText: string;
	organizationList = ORGANIZATIONS;
	refund_transaction: Transaction;
	role$: Observable<string>;
	roles$: Observable<any>;
	/**
	 * Transaction Data
	 * */
	transaction: Transaction;


	constructor(private transactionService: TransactionService,
							private route: ActivatedRoute,
							private router: Router,
							private auth: AuthService,
							private toastr: ToastrService) {
	}


	ngOnInit() {
		this.roles$ = this.auth.roles;
		this.role$ = this.auth.role;

		// Get Transaction Id from route...
		this.route.paramMap
			.subscribe(params => {
				this.id = params.get('id');
				this.getTransaction(params.get('id'));
			});


		// Check User Role...
		this.roles$.subscribe(
			roles => {

				switch (roles[0]) {
					case 'fx-ops':
						this.can_treat = true;
						break;

					case 'fx-ops-manager':
						this.can_approve = true;
						break;

					case 'treasury-ops':
						this.can_fulfil = true;
						break;

					default:
						this.is_client = true;
						break;
				}
			}
		);
	}


	computeTLogic() {
		if (!this.transaction) {
			return;
		}

		switch (this.transaction.transaction_status_id) {
			case 1: {
				this.can_be_treated = true;
				this.can_be_returned = false;
				break;
			}

			case 2: {
				this.can_be_treated = true;
				this.can_be_returned = false;
				break;
			}

			case 3: {
				this.can_be_approved = true;
				break;
			}

			case 4: {
				this.can_be_fulfilled = true;
				break;
			}

			case 5: {
				this.can_be_returned = false;
				this.can_be_cancelled = false;
				break;
			}

			case 6: { // CLOSED...
				this.can_be_updated = true;
				this.can_be_returned = false;
				this.can_be_cancelled = false;
				break;
			}

			default: {
				break;
			}
		}

		switch (true) {
			// FX-Ops...
			case this.can_treat && this.can_be_treated:
				this.can_take_action = true;
				this.can_modify_aml_kyc = true;
				this.can_modify_condition = true;
				this.can_modify_swap_charges = true;
				this.can_modify_org = true;

				break;

			// FX-Ops...
			case this.can_treat && this.can_be_updated:
				this.can_take_action = true;
				this.can_modify_funds_check = true;

				break;

			// FX-Ops Manager...
			case this.can_approve && this.can_be_approved:
				this.can_take_action = true;
				// this.can_modify_condition = true;
				// this.can_modify_swap_charges = true;
				// this.can_modify_org = true;
				break;

			// Treasury-Ops
			case this.can_fulfil && this.can_be_fulfilled:
				this.can_take_action = true;
				this.can_modify_funds_check = true;
				break;

			// I don't know what to do
			default:
				this.can_take_action = false;
		}
	}


	refreshTransaction() {
		delete this.transaction;
		this.getTransaction(this.id);
	}


	getTransaction(id: string): void {
		this.transactionService.getTransaction(id)
			.subscribe(
				transaction => {
					if (!transaction) {
						this.router.navigate(['../../'], {relativeTo: this.route}).catch();
					}

					function round(number: number) {
						return Math.round(number * 100) / 100;
					}

					// Set all configs according to role and status...
					this.transaction = transaction;
					switch (true) {
						case Transaction.isLocal(this.transaction.selling_product_id):
							this.transaction.local_rate = round(transaction.rate);
							break;

						case Transaction.isLocal(this.transaction.buying_product_id):
							this.transaction.local_rate = round(1 / transaction.rate);
							break;

						default:
							this.transaction.local_rate = round(transaction.rate);
							break;

					}
					switch (true) {
						case Transaction.isLocal(transaction.selling_product_id):
							this.transaction.fixed_product = transaction.buying_product_id;
							this.transaction.dynamic_product = transaction.selling_product_id;
							break;

						case Transaction.isLocal(transaction.buying_product_id):
							this.transaction.fixed_product = transaction.selling_product_id;
							this.transaction.dynamic_product = transaction.buying_product_id;
							break;

						default:
							this.transaction.fixed_product = transaction.buying_product_id;
							this.transaction.dynamic_product = transaction.selling_product_id;
					}

					this.refund_transaction = new RefundTransaction(transaction);
					this.computeTLogic();
				}
			);
	}


	updateRateAndCalculatedAmount() {
		switch (true) {
			case Transaction.isLocal(this.transaction.selling_product_id):
				this.transaction.rate = this.transaction.local_rate;
				break;

			case Transaction.isLocal(this.transaction.buying_product_id):
				this.transaction.rate = 1 / this.transaction.local_rate;
				break;

			default:
				this.transaction.rate = this.transaction.local_rate;
				break;
		}

		this.transaction.calculated_amount = this.transaction.rate * this.transaction.amount;
	}


	takeAction(comment: string) {
		this.transaction.comment = comment;
		switch (true) {
			// FX-Ops && OPEN or IN_PROGRESS...
			case this.can_treat && this.can_be_treated:
				this.transactionService.treatTransaction(this.transaction, this.id)
					.subscribe(
						treated_transaction => {
							if (treated_transaction) {
								this.transaction = treated_transaction;
								this.toastr.success('Successfully treated');
								this.router.navigate(['../../'], {relativeTo: this.route}).catch();
							}
						}
					);
				break;

			// FX-Ops && CLOSED...
			case this.can_treat && this.can_be_updated:
				this.transactionService.updateTransaction(this.transaction, this.id)
					.subscribe(
						treated_transaction => {
							if (treated_transaction) {
								this.transaction = treated_transaction;
								this.toastr.success('Successfully approved');
								this.router.navigate(['../../'], {relativeTo: this.route}).catch();
							}
						}
					);

				break;

			// FX-Ops Manager && PENDING_APPROVAL...
			case this.can_approve && this.can_be_approved:
				this.transactionService.approveTransaction(this.transaction, this.id)
					.subscribe(
						treated_transaction => {
							if (treated_transaction) {
								this.transaction = treated_transaction;
								this.toastr.success('Successfully approved');
								this.router.navigate(['../../'], {relativeTo: this.route}).catch();
							}
						}
					);
				break;

			// Treasury-Ops && PENDING_FULFILMENT
			case this.can_fulfil && this.can_be_fulfilled:
				this.transactionService.fulfilTransaction(this.transaction, this.id)
					.subscribe(
						treated_transaction => {
							if (treated_transaction) {
								this.transaction = treated_transaction;
								this.toastr.success('Fulfilled Successfully');
								this.router.navigate(['../../'], {relativeTo: this.route}).catch();
							}
						}
					);
				break;

			// I don't know what to do
			default:
				this.toastr.info('Something is not right!');
		}
	}


	returnTransaction(comment: string) {
		this.transaction.comment = comment;
		this.transactionService.returnTransaction(this.transaction, this.id)
			.subscribe(
				treated_transaction => {
					if (treated_transaction) {
						this.transaction = treated_transaction;
						this.toastr.success('Returned Successfully');
						this.router.navigate(['../../'], {relativeTo: this.route}).catch();
					}
				},
				err => {
				},
				() => {
				}
			);
	}


	cancelTransaction(comment: string) {
		this.transaction.comment = comment;
		this.transactionService.cancelTransaction(this.transaction, this.id)
			.subscribe(
				treated_transaction => {
					if (treated_transaction) {
						this.transaction = treated_transaction;
						this.toastr.success('Cancelled Successfully');
						this.router.navigate(['../../'], {relativeTo: this.route}).catch();
					}
				}
			);
	}


	print(): void {
		let printContents, popupWin;
		printContents = document.getElementById('printableArea').innerHTML;
		popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
		popupWin.document.open();
		popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`
		);
		popupWin.document.close();
	}


	validateKYC() {
		this.transactionService.validateKYC(this.transaction.client_id, this.transaction.client.kyc)
			.subscribe(
				client => {
					if (client) {
						this.transaction.client = client;
					}
				},
				() => {

				},
				() => {

				}
			);
	}


	onSubmittedSuccessfully() {
		this.refundSwalComponent.nativeSwal.close();
	}


	public saveEmail(email: string): void {
		// ... save user email
	}


	public handleRefusalToSetEmail(dismissMethod: string): void {
		// dismissMethod can be 'cancel', 'overlay', 'close', and 'timer'
		// ... do something
	}
}
