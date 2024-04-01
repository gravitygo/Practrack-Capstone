import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private auth: Auth = inject(Auth);
  role: BehaviorSubject<string> = new BehaviorSubject('');

  constructor() {
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });
  }

  ngOnInit(): void {}
}
