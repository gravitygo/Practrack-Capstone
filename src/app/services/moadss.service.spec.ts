import { TestBed } from '@angular/core/testing';

import { MoadssService } from './moadss.service';

describe('MoadssService', () => {
  let service: MoadssService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoadssService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
