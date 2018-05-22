import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr';
import {ExpressService, ExpressTransaction} from './express.service';
import {Subject} from 'rxjs/Subject';
import {debounceTime} from 'rxjs/operators';
import {CURRENCIES, Transaction} from '../../transaction/transaction';

@Component({
  selector: 'app-express-transaction',
  templateUrl: './express-transaction.component.html',
  styleUrls: ['./express-transaction.component.css'],
  providers: [ExpressService]
})
export class ExpressTransactionComponent implements OnInit {

  transaction = new ExpressTransaction;
  successMessage: string;
  staticAlertClosed = false;
  bankList = [
    {name: 'GTB', value: 'gtb'},
    {name: 'UBA', value: 'uba'},
    {name: 'Zenith', value: 'zenith'},
    {name: 'Access', value: 'access'}
  ];
  currencyList = CURRENCIES;
  private _success = new Subject<string>();
  private submitting: boolean;

  constructor(private transactionService: ExpressService,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastsManager) {
  }

  ngOnInit(): void {
    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._success.subscribe((message) => this.successMessage = message);
    this._success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.successMessage = null);
  }

  // Submit an express transaction Request...
  requestTransaction(): void {
    this.submitting = true;
    this.transactionService.requestTransaction(this.transaction)
      .subscribe(
        _transaction => {
          if (_transaction) {

            // Announce requested transaction...
            this._success.next('Transaction Request sent successfully');
            this.transaction = new Transaction();
          }
        },
        () => {

        },
        () => {
          this.submitting = false;
        });
  }

}
