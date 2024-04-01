import { Component, inject } from '@angular/core';
import {
  Auth,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-forgot',
  templateUrl: './login-forgot.component.html',
  styleUrls: ['./login-forgot.component.scss'],
})
export class LoginForgotComponent {
  private auth: Auth = inject(Auth);
  forgotForm!: FormGroup;
  submitted = false;
  email: any;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      dlsuEmail: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    this.email = this.forgotForm.value.dlsuEmail;
    sendPasswordResetEmail(this.auth, this.email)
      .then(() => {
        this.submitted = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
