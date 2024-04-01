import { TestBed } from '@angular/core/testing';

import { AnnouncementDetailsService } from './announcement-details.service';

describe('AnnouncementDetailsService', () => {
  let service: AnnouncementDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnouncementDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
