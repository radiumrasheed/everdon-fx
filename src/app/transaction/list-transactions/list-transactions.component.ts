import {Component, OnInit} from '@angular/core';
import {TransactionService} from '../transaction.service';
import {Transaction} from '../transaction';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-list-transactions',
  templateUrl: './list-transactions.component.html',
  styleUrls: ['./list-transactions.component.css']
})
export class ListTransactionsComponent implements OnInit {
  public transactions: Transaction[];
  public transactionPage = 1;

  roles$: Observable<any>;

  constructor(private transactionService: TransactionService, private authService: AuthService) {
  }

  ngOnInit() {
    this.getTransactions();
    this.roles$ = this.authService.roles;
  }

  getTransactions(): void {
    this.transactionService.getTransactions()
      .subscribe(
        transactions => {
          if (transactions === []) {
            //
          }
          this.transactions = transactions;
        }
      );
  }

}
