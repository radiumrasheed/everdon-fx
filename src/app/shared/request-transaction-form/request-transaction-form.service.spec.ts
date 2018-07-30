import {TestBed, inject} from '@angular/core/testing';

import {RequestTransactionFormService} from './request-transaction-form.service';

describe('RequestTransactionFormService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [RequestTransactionFormService]
		});
	});

	it('should be created', inject([RequestTransactionFormService], (service: RequestTransactionFormService) => {
		expect(service).toBeTruthy();
	}));
});
