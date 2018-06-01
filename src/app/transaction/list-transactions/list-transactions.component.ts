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
  role$: Observable<any>;

  constructor(private transactionService: TransactionService, private authService: AuthService) {
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
          this.transactions = transactions;
        }
      );
  }

}
