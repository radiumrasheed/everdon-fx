import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

import {Observable, of} from 'rxjs';

import {ToastrService} from 'ngx-toastr';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError =
  <T> (operation?: string, result?: T) => (error: HttpErrorResponse) => Observable<T>;

/** Handles HttpClient errors */
@Injectable()
export class HttpErrorHandler {
  /** Create curried handleError function that already knows the service name */
  createHandleError = (serviceName = '') => <T>
  (operation = 'operation', result = {} as T) => this.handleError(serviceName, operation, result);

  constructor(private toastr: ToastrService) {
  }

  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   * @param serviceName = name of the data service that attempted the operation
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  handleError<T>(serviceName = '', operation = 'operation', result = {} as T) {

    return (e: HttpErrorResponse): Observable<T> => {
      let message: string;


      // Error throw logic based on API structure
      switch (true) {
        case e.error instanceof ErrorEvent: {
          message = 'instance of error event';
          break;
        }

        case e.error instanceof ProgressEvent && e.status !== 400: {
          message = 'Server Unavailable';
          break;
        }

        case e.status === 422: {
          for (const error of Object.keys(e.error.errors.message)) {
            message = e.error.errors.message[error];
          }
          break;
        }

        case (typeof e.error.errors === 'object') && ('message' in e.error.errors): {
          message = e.error.errors.message;
          break;
        }

        case (typeof e.error.errors === 'object') && ('error' in e.error.errors): {
          message = e.error.errors.error !== '' ? e.error.errors.error : 'Oops! An Error Occurred.';
          break;
        }

        case (typeof e.error === 'object') && ('message' in e.error): {
          message = e.error.message;
          break;
        }

        case e.status === 400: {
          message = e.error.error;
          break;
        }

        default: {
          message = e.message;
        }
      }


      // Throw an Error Toast
      this.toastr.error(message, operation);


      // Let the app keep running by returning a safe result.
      return of(result);
    };

  }
}


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
