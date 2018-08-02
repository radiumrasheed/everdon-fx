import {Component, OnInit} from '@angular/core';
import {TransactionService} from '../transaction.service';
import {ORGANIZATIONS, PRODUCTS, Transaction} from '../../shared/meta-data';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../../services/auth/auth.service';
import {ToastrService} from 'ngx-toastr';


@Component({
	selector: 'app-transaction-details',
	templateUrl: './transaction-details.component.html',
	styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent implements OnInit {

	/**
	 * Transaction Data
	 * */
	public transaction: Transaction;
	public currencyList = PRODUCTS;
	public organizationList = ORGANIZATIONS;

	id: string;

	public roles$: Observable<any>;
	public role$: Observable<string>;

	public nextActionText: string;
	public nextSubmitText: string;

	public can_treat = false;
	public can_approve = false;
	public can_fulfil = false;
	public can_be_rejected = true;
	public can_be_treated = false;
	public can_be_approved = false;
	public can_be_fulfilled = false;
	public can_be_cancelled = true;
	public can_modify_rate = false;
	public can_modify_funds_check = false;
	public can_modify_aml_kyc = false;
	public can_modify_condition = false;
	public can_modify_org = false;
	public can_modify_swap_charges = false;
	public can_take_action = false;
	public is_client: boolean;
	private can_be_updated = false;

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
						// this.can_treat = true;
						break;

					case 'fx-ops-lead':
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
				break;
			}

			case 2: {
				this.can_be_treated = true;
				this.can_be_rejected = false;
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
				this.can_be_rejected = false;
				this.can_be_cancelled = false;
				break;
			}

			case 6: { // CLOSED...
				this.can_be_updated = true;
				this.can_be_rejected = false;
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
				this.can_modify_condition = true;
				this.can_modify_swap_charges = true;
				this.can_modify_org = true;
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

					// Set all configs according to role and status...
					this.transaction = transaction;
					this.computeTLogic();
				}
			);
	}

	updateCalculatedAmount() {
		this.transaction.calculated_amount = this.transaction.rate * this.transaction.amount;
	}

	takeAction() {
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

	rejectTransaction() {
		this.transactionService.rejectTransaction(this.transaction, this.id)
			.subscribe(
				treated_transaction => {
					if (treated_transaction) {
						this.transaction = treated_transaction;
						this.toastr.success('Rejected Successfully');
						this.router.navigate(['../../'], {relativeTo: this.route}).catch();
					}
				},
				err => {
				},
				() => {
				}
			);
	}

	cancelTransaction() {
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
}
