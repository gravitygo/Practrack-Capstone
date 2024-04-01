import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobMatchingComponent } from './job-matching.component';

describe('JobMatchingComponent', () => {
  let component: JobMatchingComponent;
  let fixture: ComponentFixture<JobMatchingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobMatchingComponent]
    });
    fixture = TestBed.createComponent(JobMatchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
