import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  PatternValidator,
  Validators,
} from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { ManifestService } from '../services/manifest.service';
import { KeyValue } from '../model/manifest.model';
import { AccountService } from '../services/account.service';
import { TermService } from '../services/term.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  private auth: Auth = inject(Auth);
  loginForm!: FormGroup;
  submitted = false;
  failed = false;
  options: KeyValue[] = [];
  term: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService,
    private manifestService: ManifestService,
    private accountService: AccountService,
    private termService: TermService
  ) {
    this.loadingService.showLoading();

    this.manifestService.getOptions('degreeCode').subscribe((keyValues) => {
      this.options = keyValues;
      this.loadingService.hideLoading();
    });
    this.loginForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dlsuEmail: ['', [Validators.required, Validators.email]],
      idNumber: ['', [Validators.required]],
      degreeCode: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
    this.termService.getCurrentTerm().subscribe((response) => {
      this.term = response.lookupID;
    });
  }

  onSubmit() {
    this.submitted = true;
    // Access form and form controls
    if (this.loginForm.valid) {
      this.loadingService.showLoading();
      createUserWithEmailAndPassword(
        this.auth,
        this.loginForm.value['dlsuEmail'],
        this.loginForm.value['password']
      )
        .then((user) => {
          this.authService
            .registerUser(
              {
                ...this.loginForm.value,
                userID: user.user.uid,
                email: this.loginForm.value['dlsuEmail'],
                isActive: true,
                roles: 'Student',
                studentID: this.loginForm.value['idNumber'],
                degreeCode: this.loginForm.value['degreeCode'],
              },
              this.term
            )
            .subscribe(() => {
              this.accountService
                .setStudent(this.auth.currentUser!.uid)
                .subscribe(() => {
                  this.auth.signOut();
                  this.router.navigate(['login']);
                });
            });
        })
        .catch((err) => {
          this.failed = true;
          console.error(err);
        })
        .finally(() => this.loadingService.hideLoading());
    }
    console.log('Form submitted');
  }
}
