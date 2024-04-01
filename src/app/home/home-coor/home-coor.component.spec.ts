import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCoorComponent } from './home-coor.component';

describe('HomeCoorComponent', () => {
  let component: HomeCoorComponent;
  let fixture: ComponentFixture<HomeCoorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeCoorComponent]
    });
    fixture = TestBed.createComponent(HomeCoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
