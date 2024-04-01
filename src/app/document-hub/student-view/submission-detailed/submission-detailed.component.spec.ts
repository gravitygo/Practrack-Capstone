import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionDetailedComponent } from './submission-detailed.component';

describe('SubmissionDetailedComponent', () => {
  let component: SubmissionDetailedComponent;
  let fixture: ComponentFixture<SubmissionDetailedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubmissionDetailedComponent]
    });
    fixture = TestBed.createComponent(SubmissionDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
