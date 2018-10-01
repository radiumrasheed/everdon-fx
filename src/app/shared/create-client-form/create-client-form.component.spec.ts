import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClientFormComponent } from './create-client-form.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CreateClientFormService } from './create-client-form.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CreateClientFormComponent', () => {
	let component: CreateClientFormComponent;
	let fixture: ComponentFixture<CreateClientFormComponent>;
	let createClientFormServiceSnub: Partial<CreateClientFormService>;
	let createClientFormService: any;

	beforeEach(async(() => {
		createClientFormServiceSnub = {};

		TestBed.configureTestingModule({
			declarations: [CreateClientFormComponent],
			imports: [
				FormsModule,
				NgbModule,
				HttpClientTestingModule
			],
			providers: [{provide: CreateClientFormService, useValue: createClientFormServiceSnub}]
		})
			.compileComponents();

		createClientFormService = TestBed.get(CreateClientFormService);

	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateClientFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
