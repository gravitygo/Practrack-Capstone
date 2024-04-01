import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobMatchingDetailsComponent } from './job-matching-details.component';

describe('JobMatchingDetailsComponent', () => {
  let component: JobMatchingDetailsComponent;
  let fixture: ComponentFixture<JobMatchingDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobMatchingDetailsComponent]
    });
    fixture = TestBed.createComponent(JobMatchingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
