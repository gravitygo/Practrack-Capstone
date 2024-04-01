import { TestBed } from '@angular/core/testing';

import { CoorTurnoverService } from './coor-turnover.service';

describe('CoorTurnoverService', () => {
  let service: CoorTurnoverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoorTurnoverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
