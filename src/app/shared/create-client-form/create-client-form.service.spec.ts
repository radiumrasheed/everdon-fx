import {TestBed, inject} from '@angular/core/testing';

import {CreateClientFormService} from './create-client-form.service';

describe('CreateClientFormService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateClientFormService]
    });
  });

  it('should be created', inject([CreateClientFormService], (service: CreateClientFormService) => {
    expect(service).toBeTruthy();
  }));
});
