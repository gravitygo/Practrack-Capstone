import { TestBed } from '@angular/core/testing';

import { JobMatchingService } from './job-matching.service';

describe('JobMatchingService', () => {
  let service: JobMatchingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobMatchingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
