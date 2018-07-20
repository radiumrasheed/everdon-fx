import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs/index';

import {Account, Client, Product, Transaction} from '../meta-data';
import {HandleError, HttpErrorHandler} from '../../services/http-error-handler.service';
import {AppConfig} from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class RequestTransactionFormService {

  private readonly transactionUrl = AppConfig.API_URL + '/transactions';
  private readonly productUrl = AppConfig.API_URL + '/products';
  private readonly accountUrl = AppConfig.API_URL + '/accounts';
  private readonly clientUrl = AppConfig.API_URL + '/clients';
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

  requestTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.transactionUrl, transaction)
      .pipe(
        map(response => response['data']['transaction']),
        catchError(this.handleError<Transaction>('Request Transaction', null))
      );
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<any>(this.accountUrl)
      .pipe(
        map(response => response['data']['accounts'])
        // catchError(err => Observable.of([]))
      );
  }

  getClient(id: string): Observable<Client> {
    return this.http.get<Client>(this.clientUrl + '/' + id)
      .pipe(
        map(response => response['data']['client']),
        catchError(this.handleError<Client>('Get Customer', null))
      );
  }

  searchClients(term: string): Observable<Client[]> {
    if (term === '' || term.length < 3) {
      return of([]);
    }
    return this.http.get<any>(this.clientUrl + '/search/' + term)
      .pipe(
        map(response => response['data']['clients'])
      );
  }

  getClientAccounts(client_id: any): Observable<Account[]> {
    return this.http.get<any>(`${this.clientUrl}/${client_id}/accounts`)
      .pipe(
        map(response => response['data']['accounts']),
        // catchError(err => Observable.of([]))
      );
  }
}
