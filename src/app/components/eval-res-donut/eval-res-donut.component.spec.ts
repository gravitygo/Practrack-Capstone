import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvalResDonutComponent } from '../eval-res-donut/eval-res-donut.component';

describe('EvalResDonutComponent', () => {
  let component: EvalResDonutComponent;
  let fixture: ComponentFixture<EvalResDonutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvalResDonutComponent],
    });
    fixture = TestBed.createComponent(EvalResDonutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
