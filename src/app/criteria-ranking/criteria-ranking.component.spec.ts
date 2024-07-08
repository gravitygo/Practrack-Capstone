import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteriaRankingComponent } from './criteria-ranking.component';

describe('CriteriaRankingComponent', () => {
  let component: CriteriaRankingComponent;
  let fixture: ComponentFixture<CriteriaRankingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CriteriaRankingComponent]
    });
    fixture = TestBed.createComponent(CriteriaRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
