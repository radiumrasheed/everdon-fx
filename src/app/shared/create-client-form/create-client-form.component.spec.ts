import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateClientFormComponent} from './create-client-form.component';

describe('CreateClientFormComponent', () => {
  let component: CreateClientFormComponent;
  let fixture: ComponentFixture<CreateClientFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateClientFormComponent]
    })
      .compileComponents();
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
