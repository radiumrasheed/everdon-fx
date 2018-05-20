import {Injectable} from '@angular/core';

import {Product, Transaction, Account} from './transaction';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {AppConfig} from '../app.config';
import {Observable} from 'rxjs/Observable';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class TransactionService {
  private readonly transactionUrl = AppConfig.API_URL + '/transactions';
  private readonly productUrl = AppConfig.API_URL + '/products';
  private readonly accountUrl = AppConfig.API_URL + '/accounts';
  private readonly handleError: HandleError;

  constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('TransactionService');
  }

  /** GET: get the list of all videos */
  getProducts(): Observable<Product[]> {
    return this.http.get<any>(this.productUrl)
      .pipe(
        map(response => response['data']['products']),
        catchError(this.handleError<Product[]>('Get all Products', []))
      );
  }

  /** GET: get the list of all videos */
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<any>(this.transactionUrl)
      .pipe(
        map(response => response['data']['transactions']),
        catchError(this.handleError<Transaction[]>('Get Transactions', []))
      );
  }

  /** GET: get a transaction */
  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<any>(this.transactionUrl + '/' + id)
      .pipe(
        map(response => response['data']['transaction']),
        catchError(this.handleError<Transaction>('Get Transaction', null))
      );
  }

  requestTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.transactionUrl, transaction)
      .pipe(
        map(response => response['data']),
        catchError(this.handleError<Transaction>('Get Transaction', null))
      );
  }

  treatTransaction(transaction: Transaction, id: string): Observable<Transaction> {
    return this.http.put<Transaction>(this.transactionUrl + '/' + id + '/treat', transaction)
      .pipe(
        map(response => response['data'])
        // catchError(this.handleError<Transaction>('Get Transaction'))
      );
  }

  approveTransaction(transaction: Transaction, id: string): Observable<Transaction> {
    return this.http.put<Transaction>(this.transactionUrl + '/' + id + '/approve', transaction)
      .pipe(
        map(response => response['data'])
        // catchError(this.handleError<Transaction>('Get Transaction'))
      );
  }

  fulfilTransaction(transaction: Transaction, id: string): Observable<Transaction> {
    return this.http.put<Transaction>(this.transactionUrl + '/' + id + '/fulfil', transaction)
      .pipe(
        map(response => response['data'])
        // catchError(this.handleError<Transaction>('Get Transaction'))
      );
  }


  cancelTransaction(transaction: Transaction, id: string): Observable<Transaction> {
    return this.http.put<Transaction>(this.transactionUrl + '/' + id + '/cancel', transaction)
      .pipe(
        map(response => response['data'])
        // catchError(this.handleError<Transaction>('Get Transaction'))
      );
  }


  closeTransaction(transaction: Transaction, id: string): Observable<Transaction> {
    return this.http.put<Transaction>(this.transactionUrl + '/' + id + '/close', transaction)
      .pipe(
        map(response => response['data'])
        // catchError(this.handleError<Transaction>('Get Transaction'))
      );
  }


  rejectTransaction(transaction: Transaction, id: string): Observable<Transaction> {
    return this.http.put<Transaction>(this.transactionUrl + '/' + id + '/reject', transaction)
      .pipe(
        map(response => response['data'])
        // catchError(this.handleError<Transaction>('Get Transaction'))
      );
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<any>(this.accountUrl)
      .pipe(
        map(response => response['data']['accounts']),
        catchError(err => Observable.of([]))
      );
  }
}
