import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RequestTransactionFormComponent} from './request-transaction-form.component';

describe('RequestTransactionFormComponent', () => {
	let component: RequestTransactionFormComponent;
	let fixture: ComponentFixture<RequestTransactionFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [RequestTransactionFormComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RequestTransactionFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
