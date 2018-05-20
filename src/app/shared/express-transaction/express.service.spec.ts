import {TestBed, inject} from '@angular/core/testing';

import {ExpressService} from './express.service';

describe('ExpressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpressService]
    });
  });

  it('should be created', inject([ExpressService], (service: ExpressService) => {
    expect(service).toBeTruthy();
  }));
});
