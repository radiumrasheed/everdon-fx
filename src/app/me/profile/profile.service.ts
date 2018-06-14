import {Injectable} from '@angular/core';
import {HandleError, HttpErrorHandler} from '../../services/http-error-handler.service';
import {AppConfig} from '../../app.config';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {Client} from '../../transaction/transaction';
import {RequestOptions} from '@angular/http';

@Injectable()
export class ProfileService {
  private readonly clientUrl = AppConfig.API_URL + '/clients';
  private readonly handleError: HandleError;

  constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('ProfileService');
  }

  /** GET: get a transaction */
  getMyProfile(): Observable<Client> {
    return this.http.get<any>(this.clientUrl)
      .pipe(
        map(response => response['data']['client']),
        catchError(this.handleError<Client>('Get Transaction', null))
      );
  }

  updateProfile(client: FormData, id: number): Observable<Client> {
    return this.http.post<Client>(this.clientUrl + '/' + id, client, {headers: {'Content-Type': 'ignore'}})
      .pipe(
        map(response => response['data']['client']),
        catchError(this.handleError<Client>('Get Profile', null))
      );
  }
}
