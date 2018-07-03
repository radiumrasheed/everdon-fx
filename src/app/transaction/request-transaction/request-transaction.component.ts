import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr';
import {Observable} from 'rxjs/Observable';
import {catchError, debounceTime, distinctUntilChanged, merge, switchMap, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';

import {User} from '../../authentication/login/user';
import {TransactionService} from '../transaction.service';
import {Account, Product, Transaction} from '../transaction';
import {AuthService} from '../../services/auth/auth.service';
import {TRANSACTION_MODES} from '../../shared/pipes/mode.pipe';
import {TRANSACTION_TYPES} from '../../shared/pipes/type.pipe';
import {GenericOption} from '../../shared/pipes/generic-option';

@Component({
  selector: 'app-request-transaction',
  templateUrl: './request-transaction.component.html',
  styleUrls: ['./request-transaction.component.css']
})
export class RequestTransactionComponent implements OnInit {
  roles$: Observable<string>;
  role: string;

  transaction = new Transaction;
  newAccount = true;
  submitting = false;
  availableProducts: Product[];
  accounts: Account[];
  bankList = [
    {name: 'GTB', value: 'gtb'},
    {name: 'UBA', value: 'uba'},
    {name: 'Zenith', value: 'zenith'},
    {name: 'Access', value: 'access'}
  ];

  model: any;
  searching = false;
  searchFailed = false;
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);

  // TRANSACTION_STATUSES: GenericOption[] = TRANSACTION_STATUSES;
  transactionModes: GenericOption[] = TRANSACTION_MODES;
  transactionTypes: GenericOption[] = TRANSACTION_TYPES;
  // products
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this.transactionService.searchClients(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false),
      merge(this.hideSearchingWhenUnsubscribed)
    );
  formatter = (user: User) => user.full_name + ' -- ' + user.email;
  updateModel = (event: any) => {
    this.transaction.client_id = event.item.id;

    this.getAccounts(event.item.id);
  };

  constructor(private transactionService: TransactionService,
              private router: Router,
              private route: ActivatedRoute,
              private auth: AuthService,
              private toastr: ToastsManager) {
  }

  // reset account
  resetAccounts() {
    delete this.transaction.account_id;
    delete this.transaction.account_name;
    delete this.transaction.account_number;
    delete this.transaction.bank_name;
    delete this.transaction.bvn;
  }

  ngOnInit() {
    this.roles$ = this.auth.roles;
    this.roles$.subscribe(roles => this.role = roles[0]);
    this.getAvailableProducts();
    this.getMyAccounts();
  }

  // Submit a transaction Request...
  requestTransaction(): void {
    if (this.role !== 'client' && this.role !== 'fx-ops') {
      this.toastr.error('You\'re not eligible to make this request! Please refer to FX-Ops Member').catch();
      return;
    }

    this.submitting = true;
    this.transactionService.requestTransaction(this.transaction)
      .subscribe(
        _transaction => {
          if (_transaction) {
            const id = _transaction.id;

            // Navigate to the newly requested transaction...
            this.router.navigate(['..', 'details', id], {relativeTo: this.route})
              .then(status => this.toastr.success('Transaction Request sent successfully'))
              .catch(err => console.error(err, id));
          }
        },
        () => {

        }, () => {
          this.submitting = false;
        }
      );
  }

  getAvailableProducts(): void {
    this.transactionService.getProducts()
      .subscribe(
        products => {
          this.availableProducts = products;
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

  // Get Clients Accounts...
  private getAccounts(client_id: any) {
    this.transactionService.getClientAccounts(client_id)
      .subscribe(
        accounts => {
          this.accounts = accounts;
        }
      );
  }
}
