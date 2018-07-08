import {Injectable} from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import {Observable} from 'rxjs';

import {AuthService} from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the service.
    const authToken = AuthService.getToken();

    // add it if we have one
    if (authToken) {
      req = req.clone({headers: req.headers.set('Authorization', authToken)});
    }

    // if this is a login-request the header is
    // already set to x/www/formurl/encoded.
    // so if we already have a content-type, do not
    // set it, but if we don't have one, set it to
    // default --> json
    if (!req.headers.has('Content-Type')) {
      req = req.clone({headers: req.headers.set('Content-Type', 'application/json')});

    }

    // Hack for ignoring content-type
    if (req.headers.get('Content-Type') === 'ignore') {
      req = req.clone({headers: req.headers.delete('Content-Type')});
    }

    // setting the accept header
    req = req.clone({headers: req.headers.set('Accept', 'application/json')});
    return next.handle(req);
  }
}
