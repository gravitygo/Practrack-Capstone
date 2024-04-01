import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDonutComponent } from './home-donut.component';

describe('HomeDonutComponent', () => {
  let component: HomeDonutComponent;
  let fixture: ComponentFixture<HomeDonutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeDonutComponent],
    });
    fixture = TestBed.createComponent(HomeDonutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
