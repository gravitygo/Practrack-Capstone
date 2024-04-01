import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsInformationComponent } from './steps-information.component';

describe('StepsInformationComponent', () => {
  let component: StepsInformationComponent;
  let fixture: ComponentFixture<StepsInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StepsInformationComponent]
    });
    fixture = TestBed.createComponent(StepsInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
