import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyEvaluationsComponent } from './company-evaluations.component';

describe('CompanyEvaluationsComponent', () => {
  let component: CompanyEvaluationsComponent;
  let fixture: ComponentFixture<CompanyEvaluationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompanyEvaluationsComponent]
    });
    fixture = TestBed.createComponent(CompanyEvaluationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
