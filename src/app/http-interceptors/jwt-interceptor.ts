import 'rxjs/add/operator/do';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';


export class JwtInterceptor implements HttpInterceptor {

	constructor() {
	}


	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

		return next.handle(request).do((event: HttpEvent<any>) => {
			if (event instanceof HttpResponse) {
				// do stuff with response if you want
			}
		}, (err: any) => {
			if (err instanceof HttpErrorResponse) {

				if (err.status === 401 && ['token_not_provided', 'token_expired'].includes(err.error.error)) {

					// redirect to the login route
					if (window.location.href.includes('/admin/')) {
						window.location.href = '#/admin-login';
					} else if (window.location.href.includes('/me/')) {
						window.location.href = '#/login';
					}

					// or local a modal
				}
			}
		});
	}
}
