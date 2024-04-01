import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinatorViewComponent } from './coordinator-view.component';

describe('CoordinatorViewComponent', () => {
  let component: CoordinatorViewComponent;
  let fixture: ComponentFixture<CoordinatorViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoordinatorViewComponent]
    });
    fixture = TestBed.createComponent(CoordinatorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
