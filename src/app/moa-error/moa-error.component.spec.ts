import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoaErrorComponent } from './moa-error.component';

describe('MoaErrorComponent', () => {
  let component: MoaErrorComponent;
  let fixture: ComponentFixture<MoaErrorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoaErrorComponent]
    });
    fixture = TestBed.createComponent(MoaErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
