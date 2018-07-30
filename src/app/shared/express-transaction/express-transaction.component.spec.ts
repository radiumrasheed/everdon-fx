import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpressTransactionComponent} from './express-transaction.component';

describe('ExpressTransactionComponent', () => {
	let component: ExpressTransactionComponent;
	let fixture: ComponentFixture<ExpressTransactionComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ExpressTransactionComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ExpressTransactionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
