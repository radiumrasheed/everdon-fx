import {Component, DoCheck, OnInit} from '@angular/core';
import {TransactionService} from '../transaction.service';
import {Transaction} from '../transaction';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../services/auth/auth.service';
import {CurrencyPipe} from '@angular/common';
import {ProductPipe} from '../../shared/pipes/product.pipe';
import {CalendarPipe} from 'angular2-moment';
import {StatusPipe} from '../../shared/pipes/status.pipe';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-list-transactions',
  templateUrl: './list-transactions.component.html',
  styleUrls: ['./list-transactions.component.css'],
  providers: [ProductPipe, CalendarPipe, StatusPipe]
})
export class ListTransactionsComponent implements OnInit {
  public transactions: Transaction[];

  // Smart table...
  filterProductSettings = {
    type: 'list',
    config: {
      selectText: 'select..',
      // todo - map from PRODUCTS
      list: [
        {value: 1, title: 'USD'},
        {value: 2, title: 'EUR'},
        {value: 3, title: 'GBP'},
        {value: 4, title: 'NGN'}
      ],
    },
  };
  client_table_settings = {
    columns: {
      transaction_ref: {
        title: 'Transaction Reference',
        filter: true,
      },
      buying_product_id: {
        title: 'Buying',
        filter: this.filterProductSettings,
        valuePrepareFunction: (val) => {
          return this.productPipe.transform(val);
        }
      },
      selling_product_id: {
        title: 'Selling',
        filter: this.filterProductSettings,
        valuePrepareFunction: (val) => {
          return this.productPipe.transform(val);
        }
      },
      transaction_status_id: {
        title: 'Status',
        valuePrepareFunction: (val) => {
          return this.statusPipe.transform(val);
        },
        filter: true,
      },
      amount: {
        title: 'Amount',
        filter: true,
      },
      created_at: {
        title: 'Time Requested',
        filter: true,
        valuePrepareFunction: (val) => {
          return this.calendarPipe.transform(val);
        }
      }
    },
    noDataMessage: 'No transactions',
    actions: {
      add: false,
      edit: false,
      delete: false,
      columnTitle: '',
    }
  };

  roles$: Observable<any>;
  role$: Observable<any>;


  constructor(private transactionService: TransactionService,
              private authService: AuthService,
              private calendarPipe: CalendarPipe,
              private statusPipe: StatusPipe,
              private productPipe: ProductPipe,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.roles$ = this.authService.roles;
    this.role$ = this.authService.role;
    this.getTransactions();
  }

  getTransactions(): void {
    this.transactionService.getTransactions()
      .subscribe(
        transactions => {
          this.transactions = transactions.map<Transaction>(transaction => {
            // transaction.link = `<a [routerLink]="['..', 'details', ${transaction.id}]">#${transaction.transaction_ref}</a>`;
            return transaction;
          });
        }
      );
  }

}
