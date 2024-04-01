import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoaBarComponent } from './moa-bar.component';

describe('MoaBarComponent', () => {
  let component: MoaBarComponent;
  let fixture: ComponentFixture<MoaBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoaBarComponent]
    });
    fixture = TestBed.createComponent(MoaBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
