import {Component, OnInit} from '@angular/core';
import {TransactionService} from '../transaction.service';
import {Product, Transaction, Account} from '../transaction';
import {transactionStatuses} from '../pipes/status.pipe';
import {transactionModes} from '../pipes/mode.pipe';
import {transactionTypes} from '../pipes/type.pipe';
import {GenericOption} from '../pipes/generic-option';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr';

@Component({
  selector: 'app-request-transaction',
  templateUrl: './request-transaction.component.html',
  styleUrls: ['./request-transaction.component.css']
})
export class RequestTransactionComponent implements OnInit {

  transaction = new Transaction;
  availableProducts: Product[];
  myAccounts: Account[];

  // transactionStatuses: GenericOption[] = transactionStatuses;
  transactionModes: GenericOption[] = transactionModes;
  transactionTypes: GenericOption[] = transactionTypes;

  // products

  constructor(private transactionService: TransactionService,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastsManager) {
  }

  ngOnInit() {
    this.getAvailableProducts();
    this.getMyAccounts();
  }

  // Submit a transaction Request...
  requestTransaction(): void {
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
          this.myAccounts = accounts;
        }
      );
  }


}
