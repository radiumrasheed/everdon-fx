import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {ExpressService, ExpressTransaction} from './express.service';
import {PRODUCTS, Transaction} from '../../transaction/transaction';

@Component({
  selector: 'app-express-transaction',
  templateUrl: './express-transaction.component.html',
  styleUrls: ['./express-transaction.component.css'],
  providers: [ExpressService]
})
export class ExpressTransactionComponent implements OnInit {

  transaction = new ExpressTransaction;
  form1 = true;
  form2 = false;
  successMessage: string;
  staticAlertClosed = false;
  bankList = [
    {name: 'GTB', value: 'gtb'},
    {name: 'UBA', value: 'uba'},
    {name: 'Zenith', value: 'zenith'},
    {name: 'Access', value: 'access'}
  ];
  currencyList = PRODUCTS;
  private _success = new Subject<string>();
  public submitting: boolean;

  constructor(private transactionService: ExpressService,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastrService) {
  }

  ngOnInit(): void {
    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._success.subscribe((message) => this.successMessage = message);
    this._success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.successMessage = null);
  }

  // Submit an express transaction Request...
  requestTransaction(form): void {
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
          form.reset();
        });
  }

  goToForm2() {
    this.form1 = false;
    this.form2 = true;
  }

  goToForm1() {
    this.form1 = true;
    this.form2 = false;
  }

}
