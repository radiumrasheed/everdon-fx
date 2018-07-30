import {TestBed, inject} from '@angular/core/testing';

import {CreateClientFormService} from './create-client-form.service';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpErrorHandler} from '../../services/http-error-handler.service';
import {ToastrService} from 'ngx-toastr';

describe('CreateClientFormService', () => {
	let httpClient: HttpClient;
	let httpErrorHandler: HttpErrorHandler;
	let httpTestingController: HttpTestingController;
	let createClientFormService: CreateClientFormService;
	let toastrServiceStub: Partial<ToastrService>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				CreateClientFormService,
				HttpErrorHandler,
				{provide: ToastrService, useValue: toastrServiceStub}]
		});

		httpClient = TestBed.get(HttpClient);
		httpErrorHandler = TestBed.get(HttpErrorHandler);
		httpTestingController = TestBed.get(HttpTestingController);
		createClientFormService = TestBed.get(CreateClientFormService);
		toastrServiceStub = {};
	});

	afterEach(() => {
		// After every test, assert that there are no more pending requests.
		httpTestingController.verify();
	});

	it('should be created', inject([CreateClientFormService], (service: CreateClientFormService) => {
		expect(service).toBeTruthy();
	}));
});
