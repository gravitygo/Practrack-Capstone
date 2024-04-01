import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoaRadarComponent } from './moa-radar.component';

describe('MoaRadarComponent', () => {
  let component: MoaRadarComponent;
  let fixture: ComponentFixture<MoaRadarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoaRadarComponent]
    });
    fixture = TestBed.createComponent(MoaRadarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
