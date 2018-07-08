import {Injectable} from '@angular/core';

import {AppConfig} from '../../app.config';
import * as jwt_decode from 'jwt-decode';
import * as _ from 'lodash';


import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../http-error-handler.service';
import {catchError, map, tap} from 'rxjs/operators';


export const TOKEN_NAME = 'jwt_token';
export const ROLE_TOKEN_NAME = 'o8gb!zx4';
export const USER_ = 'user';
export const ADMIN_ROLES = ['systems-admin', 'fx-ops', 'fx-ops-lead', 'fx-ops-manager', 'treasury-ops'];
export const CLIENT_ROLES = ['client'];


@Injectable()
export class AuthService {
  public redirectUrl: string;
  private url = AppConfig.API_URL;
  private readonly handleError: HandleError;

  constructor(private http: HttpClient,
              private httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('TransactionService');

  }

  private _isLoggedIn = new BehaviorSubject<boolean>(false);

  get isLoggedIn() {
    return this._isLoggedIn.asObservable();
  }

  private _role = new BehaviorSubject<string>('');

  get role() {
    return this._role.asObservable();
  }

  private _roles = new BehaviorSubject<any>([]);

  get roles() {
    return this._roles.asObservable();
  }

  public _user = new BehaviorSubject<any>({});

  get user() {
    return this._user.asObservable();
  }

  static getToken(): string {
    return localStorage.getItem(TOKEN_NAME);
  }

  static getRoleToken(): string {
    return localStorage.getItem(ROLE_TOKEN_NAME);
  }

  static getUser(): any {
    return localStorage.getItem(USER_);
  }

  private static setToken(token: string): void {
    localStorage.setItem(TOKEN_NAME, 'Bearer ' + token);
  }

  private static setRoleToken(token: string): void {
    localStorage.setItem(ROLE_TOKEN_NAME, 'Bearer ' + token);
  }

  private static setUser(user: any): void {
    localStorage.setItem(USER_, user);
  }

  private static removeTokens(): void {
    localStorage.clear();
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

  private static getDecodedToken(token: string): any {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) {
      return null;
    }

    return decoded;
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


  // Check if admin token is not expired...
  adminTokenNotExpired(token?: string): boolean {
    if (!token) {
      token = AuthService.getRoleToken();
    }
    if (!token) {
      return false;
    }

    const tokenPayload = AuthService.getDecodedToken(token);
    if (tokenPayload === undefined) {
      return false;
    }

    const roles = _.split(tokenPayload['roles'], '|');
    const allowed_roles = _.intersection(roles, ADMIN_ROLES);

    if (allowed_roles.length <= 0) {
      return false;
    }

    this._user.next(JSON.parse(AuthService.getUser()));
    this._role.next('admin');
    this._roles.next(roles);
    this._isLoggedIn.next(true);

    return true;
  }


  // Check if client token is not expired...
  clientTokenNotExpired(token?: string): boolean {
    if (!token) {
      token = AuthService.getRoleToken();
    }
    if (!token) {
      return false;
    }

    const tokenPayload = AuthService.getDecodedToken(token);
    if (tokenPayload === undefined) {
      return false;
    }

    const roles = _.split(tokenPayload['roles'], '|');
    const allowed_roles = _.intersection(roles, CLIENT_ROLES);

    if (allowed_roles.length <= 0) {
      return false;
    }

    this._user.next(JSON.parse(AuthService.getUser()));
    this._role.next(roles[0]);
    this._roles.next(roles);
    this._isLoggedIn.next(true);

    return true;
  }


  // Login User...
  login(user): Observable<any> {
    return this.http
      .post(`${this.url}/auth/login`, user)
      .pipe(
        map(response => response['data']),
        tap(data => {
          AuthService.setToken(data['token']);
          AuthService.setRoleToken(data['_token']);
          AuthService.setUser(JSON.stringify({name: data['user']['name'], email: data['user']['email']}));

          this._isLoggedIn.next(true);
        }),
        catchError(this.handleError<any>('Login', null))
      );
  }


  // Login Admin User...
  adminLogin(user): Observable<any> {
    return this.http
      .post(`${this.url}/auth/admin-login`, user)
      .pipe(
        map(response => response['data']),
        tap(data => {
          AuthService.setToken(data['token']);
          AuthService.setRoleToken(data['_token']);
          AuthService.setUser(JSON.stringify({name: data['user']['name'], email: data['user']['email']}));

          this._isLoggedIn.next(true);
        }),
        catchError(this.handleError<any>('Admin Login', null))
      );
  }


  // Sign Up User...
  signUp(user): Observable<any> {
    return this.http
      .post(`${this.url}/auth/signup`, user)
      .pipe(
        map(response => response['data']),
        tap(data => {
          AuthService.setToken(data['token']);
          AuthService.setRoleToken(data['_token']);
          AuthService.setUser(JSON.stringify({name: data['user']['name'], email: data['user']['email']}));

          this._isLoggedIn.next(true);
        }),
        catchError(this.handleError<any>('Sign Up', null))
      );
  }


  // Logout User...
  logout(): void {
    AuthService.removeTokens();
    this._isLoggedIn.next(false);
    this._roles.next([]);
  }

  recover(user): Observable<any> {
    return this.http
      .post(`${this.url}/auth/reset-password`, user)
      .pipe(
        map(response => response['data'])
      );
  }
}
