import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthTemplateComponent } from './auth-template.component';

describe('AuthTemplateComponent', () => {
  let component: AuthTemplateComponent;
  let fixture: ComponentFixture<AuthTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuthTemplateComponent]
    });
    fixture = TestBed.createComponent(AuthTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
