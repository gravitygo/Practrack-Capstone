import { TestBed } from '@angular/core/testing';

import { CompanyListingService } from './company-listing.service';

describe('CompanyListingService', () => {
  let service: CompanyListingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyListingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
