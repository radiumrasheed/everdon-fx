import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';

import {AppConfig} from '../../app.config';
import * as jwt_decode from 'jwt-decode';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';


export const TOKEN_NAME = 'jwt_token';

@Injectable()
export class AuthService {

  isLoggedIn = false;
  redirectUrl: string;

  private url = AppConfig.API_URL;
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http) {
  }

  static getToken(): string {
    return localStorage.getItem(TOKEN_NAME);
  }

  private static setToken(token: string): void {
    localStorage.setItem(TOKEN_NAME, 'Bearer ' + token);
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

    this.isLoggedIn = true;
    return token_date.valueOf() > new Date().valueOf();
  }

  login(user): Promise<string> {
    return this.http
      .post(`${this.url}/login`, JSON.stringify(user), {headers: this.headers})
      .toPromise()
      .then(res => {
        AuthService.setToken(res.json().data.token);

        return res.json().data;
      });
  }


  logout(): void {
    this.isLoggedIn = false;
  }

}
