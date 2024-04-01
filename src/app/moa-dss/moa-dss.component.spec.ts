import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoaDSSComponent } from './moa-dss.component';

describe('MoaDSSComponent', () => {
  let component: MoaDSSComponent;
  let fixture: ComponentFixture<MoaDSSComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoaDSSComponent]
    });
    fixture = TestBed.createComponent(MoaDSSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
