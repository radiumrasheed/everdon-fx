/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './auth-interceptor';
import { CachingInterceptor } from './caching-interceptor';
import { EnsureHttpsInterceptor } from './ensure-https-interceptor';
import { LoggingInterceptor } from './logging-interceptor';
import { NoopInterceptor } from './noop-interceptor';
import { TrimNameInterceptor } from './trim-name-interceptor';
import { UploadInterceptor } from './upload-interceptor';
import { JwtInterceptor } from './jwt-interceptor';


/** Http interceptor providers in outside-in order */
export const HttpInterceptorProviders = [
	{provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true},
	// { provide: HTTP_INTERCEPTORS, useClass: EnsureHttpsInterceptor, multi: true },
	{provide: HTTP_INTERCEPTORS, useClass: TrimNameInterceptor, multi: true},
	{provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true},
	// {provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true},
	// { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor, multi: true },
	{provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
	{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
];


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
