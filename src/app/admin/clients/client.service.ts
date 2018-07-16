import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppConfig} from '../../app.config';
import {HandleError, HttpErrorHandler} from '../../services/http-error-handler.service';
import {Client} from '../../shared/meta-data/client';
import {catchError, map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable()
export class ClientService {

  private readonly clientUrl = AppConfig.API_URL + '/clients';
  private readonly handleError: HandleError;

  constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('clientService');
  }

  getClient(id: string): Observable<Client> {
    return this.http.get<Client>(this.clientUrl + '/' + id)
      .pipe(
        map(response => response['data']['client']),
        catchError(this.handleError<Client>('Get Customer', null))
      );
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.post<Client>(this.clientUrl + '/' + id, client)
      .pipe(
        map(response => response['data']['client']),
        catchError(this.handleError<Client>('Update Customer', null))
      );
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client>(this.clientUrl)
      .pipe(
        map(response => response['data']['clients']),
        catchError(this.handleError<Client[]>('Get Customer', []))
      );
  }

  createIndividualClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.clientUrl + '/individual', client)
      .pipe(
        map(response => response['data']),
        catchError(this.handleError<Client>('Create Customer', null))
      );
  }

  createCooperateClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.clientUrl + '/cooperate', client)
      .pipe(
        map(response => response['data']),
        catchError(this.handleError<Client>('Create Customer', null))
      );
  }
}
