import {TestBed, async} from '@angular/core/testing';

import {AppComponent} from './app.component';
import {SpinnerComponent} from './shared/spinner.component';
import {RouterTestingModule} from '@angular/router/testing';
import {ToastrService} from 'ngx-toastr';

let toastrServiceStub: Partial<ToastrService>;
let toastrService: any;

describe('AppComponent', () => {
	beforeEach(async(() => {
		toastrServiceStub = {};

		TestBed.configureTestingModule({
			declarations: [
				AppComponent,
				SpinnerComponent,
			],
			providers: [{provide: ToastrService, useValue: toastrServiceStub}],
			imports: [RouterTestingModule]
		}).compileComponents();

		toastrService = TestBed.get(ToastrService);

	}));

	it('should create the app', async(() => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
	}));

	it('stub object and injected ToastrService should not be the same', () => {
		expect(toastrServiceStub === toastrService).toBe(false);
	});
});
