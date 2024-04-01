import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvalGradeDonutComponent } from './eval-grade-donut.component';

describe('EvalGradeDonutComponent', () => {
  let component: EvalGradeDonutComponent;
  let fixture: ComponentFixture<EvalGradeDonutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvalGradeDonutComponent]
    });
    fixture = TestBed.createComponent(EvalGradeDonutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
