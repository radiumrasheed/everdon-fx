import {Injectable} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {HandleError, HttpErrorHandler} from '../../services/http-error-handler.service';
import {HttpClient} from '@angular/common/http';
import {AppConfig} from '../../app.config';

export class ExpressTransaction {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  email?: string;
  phone?: string;
  is_exchange?: boolean;
  amount?: number;
  i_have?: number;
  i_want?: number;
  is_ngn_transfer?: boolean;
  not_ngn_transfer?: boolean;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  bvn?: string;
}


@Injectable()
export class ExpressService {
  handleError: HandleError;
  transaction: ExpressTransaction;
  transactionUrl: string = AppConfig.API_URL + '/transactions/express';

  constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('TransactionService');
  }

  requestTransaction(transaction: ExpressTransaction): Observable<ExpressTransaction> {
    return this.http.post<ExpressTransaction>(this.transactionUrl, transaction)
      .pipe(
        map(response => response['data']),
        catchError(this.handleError<ExpressTransaction>('Get Transaction', null))
      );
  }
}
