import {Component, OnInit} from '@angular/core';
import {TransactionService} from '../transaction.service';
import {CURRENCY_LIST, Transaction} from '../transaction';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../services/auth/auth.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ToastsManager} from 'ng2-toastr';


@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  providers: [TransactionService]
})
export class TransactionDetailsComponent implements OnInit {
  public selectedTransaction: Transaction;
  public currencyList = CURRENCY_LIST;
  id: string;

  roles$: Observable<any>;

  private nextActionText: string;
  private nextSubmitText: string;

  private can_treat = false;
  private can_approve = false;
  private can_be_treated = false;
  private can_be_approved = false;
  private can_modify_rate = false;
  private can_fulfil = false;
  private can_be_fulfilled = false;
  private no_action = false;
  private can_comment = false;

  constructor(private transactionService: TransactionService,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private toastr: ToastsManager) {
  }

  ngOnInit() {
    this.roles$ = this.authService.roles;

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
          case 'fx-ops-lead':
            this.can_treat = true;
            break;

          case 'fx-ops-manager':
            this.can_approve = true;
            break;

          case 'treasury-ops':
            this.can_fulfil = true;
            break;

          case 'systems-admin':
            this.can_treat = true;
            this.can_approve = true;
            this.can_fulfil = true;
            break;

          default:
            this.no_action = true;
            break;
        }
      }
    );
  }

  getTransactionLogic() {
    switch (this.selectedTransaction.transaction_status_id) {
      case 1:
        this.nextActionText = 'Treat Transaction';
        this.nextSubmitText = 'Update Rate';
        this.can_modify_rate = true;
        this.can_comment = true;
        this.can_be_treated = true;
        break;

      case 2:
        this.nextActionText = '...';
        this.nextSubmitText = '...';
        this.can_comment = true;
        break;

      case 3:
        this.nextActionText = 'Approve Transaction';
        this.nextSubmitText = 'Comment & Approve';
        this.can_be_approved = true;
        this.can_comment = true;
        break;

      case 4:
        this.nextActionText = 'Fulfil Transaction';
        this.nextSubmitText = 'Comment & Fulfil';
        this.can_be_fulfilled = true;
        this.can_comment = true;
        break;

      case 5:
        this.no_action = true;
        break;

      default:
        break;
    }
  }

  refreshTransaction() {
    this.getTransaction(this.id);
    console.log('refreshed');
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
          this.getTransactionLogic();
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
      // FX-Ops...
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
              console.error(err);
              this.toastr.error(err.message || err).catch();
            }
          );
        break;

      // FX-Ops Manager
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
            }
          );
        break;

      // Treasury-Ops
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
            }
          );
        break;

      // I don't know what to do
      default:
        this.toastr.info('Undecided').catch();
    }
  }
}
