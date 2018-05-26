import {Component, OnInit} from '@angular/core';
import {TransactionService} from '../transaction.service';
import {CURRENCIES, ORGANIZATIONS, Transaction} from '../transaction';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../services/auth/auth.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ToastsManager} from 'ng2-toastr';


@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent implements OnInit {

  public selectedTransaction: Transaction;
  public currencyList = CURRENCIES;
  public organizationList = ORGANIZATIONS;

  id: string;

  public roles$: Observable<any>;
  public role$: Observable<string>;

  public nextActionText: string;
  public nextSubmitText: string;

  public can_treat = false;
  public can_approve = false;
  public can_be_treated = false;
  public can_be_approved = false;
  public can_modify_rate = false;
  public can_fulfil = false;
  public can_be_fulfilled = false;
  public no_action = false;
  // public can_comment = false;
  public can_take_action = false;
  public is_client: boolean;
  public can_be_rejected = true;

  constructor(private transactionService: TransactionService,
              private route: ActivatedRoute,
              private router: Router,
              private auth: AuthService,
              private toastr: ToastsManager) {
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

          case 'fx-ops-lead':
            this.can_approve = true;
            break;

          case 'fx-ops-manager':
            this.can_approve = true;
            break;

          case 'treasury-ops':
            this.can_fulfil = true;
            break;

          case 'systems-admin':
            // this.can_treat = true;
            // this.can_approve = true;
            // this.can_fulfil = true;
            break;

          default:
            this.is_client = true;
            break;
        }
      }
    );
  }

  computeTLogic() {
    if (!this.selectedTransaction) {
      return;
    }

    switch (this.selectedTransaction.transaction_status_id) {
      case 1: {
        this.nextActionText = 'Treat/Review Transaction';
        this.nextSubmitText = 'Update & Treat';
        this.can_be_treated = true;
        break;
      }

      case 2: {
        this.nextActionText = 'Treat/Review Transaction';
        this.nextSubmitText = 'Update & Treat';
        this.can_be_treated = true;
        this.can_be_rejected = false;
        break;
      }

      case 3: {
        this.nextActionText = 'Approve Transaction';
        this.nextSubmitText = 'Comment & Approve';
        this.can_be_approved = true;
        break;
      }

      case 4: {
        this.nextActionText = 'Fulfil Transaction';
        this.nextSubmitText = 'Comment & Fulfil';
        this.can_be_fulfilled = true;
        break;
      }

      case 5: {
        this.no_action = true;
        this.nextActionText = 'No Action';
        this.nextSubmitText = 'No Action';
        break;
      }

      case 6: {
        this.no_action = true;
        this.nextActionText = 'CLOSED';
        this.nextSubmitText = 'CLOSED';
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
        break;

      // FX-Ops Manager
      case this.can_approve && this.can_be_approved:
        this.can_take_action = true;

        break;

      // Treasury-Ops
      case this.can_fulfil && this.can_be_fulfilled:
        this.can_take_action = true;

        break;

      // I don't know what to do
      default:
        this.can_take_action = false;
    }
  }

  refreshTransaction() {
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
          this.selectedTransaction = transaction;
          this.computeTLogic();
        },
        error1 => {
        },
        () => {
        }
      );
  }

  updateCalculatedAmount() {
    this.selectedTransaction.calculated_amount = this.selectedTransaction.rate * this.selectedTransaction.amount;
  }

  takeAction() {
    switch (true) {
      // FX-Ops && OPEN or IN_PROGRESS...
      case this.can_treat && this.can_be_treated:
        this.transactionService.treatTransaction(this.selectedTransaction, this.id)
          .subscribe(
            treated_transaction => {
              if (treated_transaction) {
                this.selectedTransaction = treated_transaction;
                this.toastr.success('Successfully treated').catch();
              }
            },
            err => {
            },
            () => {
              this.router.navigate(['../../'], {relativeTo: this.route}).catch();
            }
          );
        break;

      // FX-Ops Manager && PENDING_APPROVAL...
      case this.can_approve && this.can_be_approved:
        this.transactionService.approveTransaction(this.selectedTransaction, this.id)
          .subscribe(
            treated_transaction => {
              if (treated_transaction) {
                this.selectedTransaction = treated_transaction;
                this.toastr.success('Successfully approved').catch();
              }
            },
            err => {
              console.error(err);
              this.toastr.error(err.message || err).catch();
            },
            () => {
              this.router.navigate(['../../'], {relativeTo: this.route}).catch();
            }
          );
        break;

      // Treasury-Ops && PENDING_FULFILMENT
      case this.can_fulfil && this.can_be_fulfilled:
        this.transactionService.fulfilTransaction(this.selectedTransaction, this.id)
          .subscribe(
            treated_transaction => {
              if (treated_transaction) {
                this.selectedTransaction = treated_transaction;
                this.toastr.success('Fulfilled Successfully').catch();
              }
            },
            err => {
              console.error(err);
              this.toastr.error(err.message || err).catch();
            },
            () => {
              this.router.navigate(['../../'], {relativeTo: this.route}).catch();
            }
          );
        break;

      // I don't know what to do
      default:
        this.toastr.info('Undecided').catch();
    }
  }

  rejectTransaction() {
    this.transactionService.rejectTransaction(this.selectedTransaction, this.id)
      .subscribe(
        treated_transaction => {
          if (treated_transaction) {
            this.selectedTransaction = treated_transaction;
            this.toastr.success('Rejected Successfully').catch();
            this.router.navigate(['../../'], {relativeTo: this.route}).catch();
          }
        },
        err => {
        },
        () => {
        }
      );
  }
}
