import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginForgotComponent } from './login-forgot.component';

describe('LoginForgotComponent', () => {
  let component: LoginForgotComponent;
  let fixture: ComponentFixture<LoginForgotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginForgotComponent]
    });
    fixture = TestBed.createComponent(LoginForgotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
