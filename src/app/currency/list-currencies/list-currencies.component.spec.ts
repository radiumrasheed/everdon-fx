import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ListCurrenciesComponent} from './list-currencies.component';

describe('ListCurrenciesComponent', () => {
	let component: ListCurrenciesComponent;
	let fixture: ComponentFixture<ListCurrenciesComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ListCurrenciesComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ListCurrenciesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
