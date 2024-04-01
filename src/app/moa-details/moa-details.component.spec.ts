import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoaDetailsComponent } from './moa-details.component';

describe('MoaDetailsComponent', () => {
  let component: MoaDetailsComponent;
  let fixture: ComponentFixture<MoaDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoaDetailsComponent]
    });
    fixture = TestBed.createComponent(MoaDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
