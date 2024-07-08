import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Auth, User, user } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Router } from '@angular/router';
import { LoadingService } from '../services/loading.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth: Auth = inject(Auth);
  loginForm!: FormGroup;
  submitted = false;
  user$ = user(this.auth);
  userSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      if (aUser) this.router.navigate(['/home']);
    });
    this.loginForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      dlsuEmail: ['', [Validators.required, Validators.email]],
      idNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy
    this.userSubscription.unsubscribe();
  }

  emailAndPasswordSignIn(user: any) {
    this.loadingService.showLoading();
    signInWithEmailAndPassword(this.auth, user.dlsuEmail, user.password)
      .then((userCredential) => {
        // Get the user from the user credential
        const user = userCredential.user;
        // Get the ID token result
        return user.getIdTokenResult();
      })
      .then((idTokenResult) => {
        // Access custom claims from the ID token result
        const customClaims = idTokenResult.claims;
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => this.loadingService.hideLoading());
  }

  onSubmit() {
    this.submitted = true;
    // Access form and form controls
    console.log('Form submitted');
    this.emailAndPasswordSignIn(this.loginForm.value);
  }
}
