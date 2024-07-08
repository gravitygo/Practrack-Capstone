import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent {
  private auth: Auth = inject(Auth);
  role: BehaviorSubject<string> = new BehaviorSubject('');

  constructor() {
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });
  }
  ngOnInit() {}
}
