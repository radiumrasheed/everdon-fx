import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';

import {ToastsManager} from 'ng2-toastr/ng2-toastr';
import {forEach} from '@angular/router/src/utils/collection';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError =
  <T> (operation?: string, result?: T) => (error: HttpErrorResponse) => Observable<T>;

/** Handles HttpClient errors */
@Injectable()
export class HttpErrorHandler {
  /** Create curried handleError function that already knows the service name */
  createHandleError = (serviceName = '') => <T>
  (operation = 'operation', result = {} as T) => this.handleError(serviceName, operation, result);

  constructor(private toastr: ToastsManager) {
  }

  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   * @param serviceName = name of the data service that attempted the operation
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  handleError<T>(serviceName = '', operation = 'operation', result = {} as T) {

    return (error: HttpErrorResponse): Observable<T> => {
      let message: string;

      // todo - Handle 422

      if (error.error instanceof ErrorEvent || ProgressEvent) {
        console.error(error);
        message = error.statusText;
      } else {
        message = `${error.error.message}`;
      }

      // TODO: better job of transforming error for user consumption
      // this.messageService.add(`${serviceName}: ${operation} failed: ${message}`);

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
