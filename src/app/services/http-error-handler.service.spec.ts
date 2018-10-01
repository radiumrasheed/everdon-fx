import { inject, TestBed } from '@angular/core/testing';
import { HttpErrorHandler } from './http-error-handler.service';
import { ToastrService } from 'ngx-toastr';

let toastrServiceStub: Partial<ToastrService>;

describe('HttpErrorHandler', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [HttpErrorHandler, {provide: ToastrService, useValue: toastrServiceStub}]
		});

		toastrServiceStub = {};
	});

	it('should be created', inject([HttpErrorHandler], (service: HttpErrorHandler) => {
		expect(service).toBeTruthy();
	}));
});
