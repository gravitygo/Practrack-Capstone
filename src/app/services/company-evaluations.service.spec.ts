import { TestBed } from '@angular/core/testing';

import { CompanyEvalService } from './company-evaluations.service';

describe('CompanyEvalService', () => {
  let service: CompanyEvalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyEvalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
