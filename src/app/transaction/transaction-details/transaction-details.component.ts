import {Component, OnInit} from '@angular/core';
import {TransactionService} from '../transaction.service';
import {Transaction} from '../transaction';
import {NgbProgressbarConfig} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  providers: [TransactionService]
})
export class TransactionDetailsComponent implements OnInit {
  public selectedTransaction: Transaction;

  constructor(private transactionService: TransactionService) {
  }

  ngOnInit() {
    this.getTransaction();
  }

  getTransaction(): void {
    this.transactionService.getTransaction()
      .then(transaction => this.selectedTransaction = transaction)
      .catch();
  }
}
