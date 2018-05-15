import {Injectable} from '@angular/core';

import {Transaction} from './transaction';
import {TRANSACTIONS} from './mock-transaction';

@Injectable()
export class TransactionService {
  getTransactions(): Promise<Transaction[]> {
    return Promise.resolve(TRANSACTIONS);
  }


  getTransaction(): Promise<Transaction> {
    return Promise.resolve(TRANSACTIONS[1]);
  }
}
