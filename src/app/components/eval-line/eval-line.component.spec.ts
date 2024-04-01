import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvalLineComponent } from './eval-line.component';

describe('EvalLineComponent', () => {
  let component: EvalLineComponent;
  let fixture: ComponentFixture<EvalLineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvalLineComponent]
    });
    fixture = TestBed.createComponent(EvalLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
