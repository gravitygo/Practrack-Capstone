import { Component, inject } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  constructor(private accountServ: AccountService) {}

  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;
  email: any;

  ngOnInit(): void {
    this.forgotPassword();
  }

  forgotPassword() {
    this.userID = this.userLogged.currentUser?.uid!;
    console.log(this.userID);
    this.accountServ.getEmail(this.userID).subscribe((response) => {
      this.email = response.email[0].email;
      sendPasswordResetEmail(this.auth, this.email).catch((error) => {
        console.log(error);
      });
    });
  }
}
