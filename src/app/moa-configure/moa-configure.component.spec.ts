import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoaConfigureComponent } from './moa-configure.component';

describe('MoaConfigureComponent', () => {
  let component: MoaConfigureComponent;
  let fixture: ComponentFixture<MoaConfigureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoaConfigureComponent]
    });
    fixture = TestBed.createComponent(MoaConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
