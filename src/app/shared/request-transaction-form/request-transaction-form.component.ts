import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, merge, switchMap, tap} from 'rxjs/operators';

import {User} from '../../authentication/login/user';
import {Account, BANKS, COUNTRIES, PRODUCTS, Transaction, TRANSACTION_MODES, TRANSACTION_TYPES, GenericOption} from '../meta-data';
import {AuthService} from '../../services/auth/auth.service';
import {RequestTransactionFormService} from './request-transaction-form.service';

@Component({
  selector: 'app-request-transaction-form',
  templateUrl: './request-transaction-form.component.html',
  styleUrls: ['./request-transaction-form.component.css'],
  providers: [RequestTransactionFormService]
})
export class RequestTransactionFormComponent implements OnInit {
  roles$: Observable<string>;
  @Input() role: string;
  @Output() submittedSuccessfully = new EventEmitter<string>();

  transaction = new Transaction();
  newAccount = true;
  submitting = false;
  countries = COUNTRIES;
  availableProducts = PRODUCTS;
  accounts: Account[];
  bankList = BANKS;
  transactionModes: GenericOption[] = TRANSACTION_MODES;
  transactionTypes: GenericOption[] = TRANSACTION_TYPES;

  model: any;
  form1 = true;
  form2 = false;
  searching = false;
  searchFailed = false;
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);


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
  formatter = (user: User) => user.first_name + ' ' + user.last_name + ' -- ' + user.email;
  updateModel = (event: any) => {
    this.transaction.client_id = event.item.id;

    this.getAccounts(event.item.id);
  };

  constructor(private transactionService: RequestTransactionFormService,
              private router: Router,
              private route: ActivatedRoute,
              private auth: AuthService,
              private toastr: ToastrService) {
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
    if (!this.role) {
      try {
        this.roles$ = this.auth.roles;
        this.roles$.subscribe(roles => this.role = roles[0]);
      } catch (e) {
        console.error(e);
      }
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

            this.submittedSuccessfully.emit(id);
            this.toastr.success('Transaction Request sent successfully');

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


  goToForm2() {
    this.form1 = false;
    this.form2 = true;
  }

  goToForm1() {
    this.form1 = true;
    this.form2 = false;
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
