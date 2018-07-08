import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {AppConfig} from '../../app.config';
import {HandleError, HttpErrorHandler} from '../../services/http-error-handler.service';

@Injectable()
export class DashboardService {
  private readonly dashboardUrl = AppConfig.API_URL + '/dashboard';
  private readonly handleError: HandleError;

  constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('ProfileService');
  }

  /** GET: get a transaction */
  figures(): Observable<any> {
    return this.http.get<any>(this.dashboardUrl + '/figures')
      .pipe(
        map(response => response['data']),
        catchError(this.handleError<any>('Dashboard Statistics', null))
      );
  }

  recentTransactions(): Observable<any> {
    return this.http.get<any>(this.dashboardUrl + '/recent_transactions')
      .pipe(
        map(response => response['data']['transactions']),
        catchError(this.handleError<any>('Recent Transactions', null))
      );
  }

  timeline(): Observable<any> {
    return this.http.get<any>(this.dashboardUrl + '/timeline/rate')
      .pipe(
        map(response => response['data']),
        catchError(this.handleError<any>('Get Rates Timeline', null))
      );
  }
}
