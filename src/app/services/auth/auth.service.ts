import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';

import {AppConfig} from '../../app.config';
import * as jwt_decode from 'jwt-decode';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../http-error-handler.service';
import {Product} from '../../transaction/transaction';
import {catchError, map, tap} from 'rxjs/operators';


export const TOKEN_NAME = 'jwt_token';

@Injectable()
export class AuthService {
  redirectUrl: string;
  private url = AppConfig.API_URL;
  private headers = new Headers({'Content-Type': 'application/json'});
  private readonly handleError: HandleError;

  constructor(private http: Http,
              private _http: HttpClient,
              private httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('TransactionService');

  }

  private _isLoggedIn = new BehaviorSubject<boolean>(false);

  get isLoggedIn() {
    return this._isLoggedIn.asObservable();
  }

  static getToken(): string {
    return localStorage.getItem(TOKEN_NAME);
  }

  private static setToken(token: string): void {
    localStorage.setItem(TOKEN_NAME, 'Bearer ' + token);
  }

  private static removeToken(): void {
    localStorage.removeItem(TOKEN_NAME);
  }

  private static getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  // Check if token is not expired...
  tokenNotExpired(token?: string): boolean {
    if (!token) {
      token = AuthService.getToken();
    }
    if (!token) {
      return false;
    }

    const token_date = AuthService.getTokenExpirationDate(token);
    if (token_date === undefined) {
      return false;
    }

    this._isLoggedIn.next(true);
    return token_date.valueOf() > new Date().valueOf();
  }


  // Login User...
  login(user): Observable<any> {
    return this._http
      .post(`${this.url}/login`, user)
      .pipe(
        map(response => response['data']['token']),
        tap(token => {
          AuthService.setToken(token);
          this._isLoggedIn.next(true);
        }),
        catchError(this.handleError<any>('Login', null))
      );
  }


  // Login Admin User...
  adminLogin(user): Observable<any> {
    return this._http
      .post(`${this.url}/admin-login`, user)
      .pipe(
        map(response => response['data']['token']),
        tap(token => {
          AuthService.setToken(token);
          this._isLoggedIn.next(true);
        }),
        catchError(this.handleError<any>('Admin Login', null))
      );
  }


  // Sign Up User...
  signUp(user): Observable<any> {
    return this._http
      .post(`${this.url}/signup/client`, user)
      .pipe(
        map(response => response['data']['token']),
        tap(token => {
          AuthService.setToken(token);
          this._isLoggedIn.next(true);
        }),
        catchError(this.handleError<any>('Sign Up', null))
      );
  }


  // Logout User...
  logout(): void {
    AuthService.removeToken();
    this._isLoggedIn.next(false);
  }

}
