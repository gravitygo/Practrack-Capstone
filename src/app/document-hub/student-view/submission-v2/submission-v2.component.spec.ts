import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionV2Component } from './submission-v2.component';

describe('SubmissionV2Component', () => {
  let component: SubmissionV2Component;
  let fixture: ComponentFixture<SubmissionV2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubmissionV2Component]
    });
    fixture = TestBed.createComponent(SubmissionV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
