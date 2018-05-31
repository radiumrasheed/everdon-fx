import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../../services/http-error-handler.service';
import {Observable} from 'rxjs/Observable';
import {catchError, map} from 'rxjs/operators';
import {AppConfig} from '../../app.config';

declare const Pusher: any;

@Injectable()
export class AdminDashboardService {
  private readonly dashboardUrl = AppConfig.API_URL + '/dashboard';
  private readonly handleError: HandleError;
  private channel: any;

  constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    const pusher = new Pusher(AppConfig.PUSHER_KEY, {cluster: AppConfig.PUSHER_CLUSTER});
    this.handleError = httpErrorHandler.createHandleError('ProfileService');
    this.channel = pusher.subscribe('new-rates');
  }

  public init() {
    return this.channel;
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

  buckets(): Observable<any> {
    return this.http.get<any>(this.dashboardUrl + '/buckets')
      .pipe(
        map(response => response['data']['products']),
        catchError(this.handleError<any>('Get Bucket Balance', null))
      );
  }

  timeline(): Observable<any> {
    return this.http.get<any>(this.dashboardUrl + '/timeline')
      .pipe(
        map(response => response['data']),
        catchError(this.handleError<any>('Get Rates Timeline', null))
      );
  }
}
