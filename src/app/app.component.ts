import { Component, HostBinding, inject, signal } from '@angular/core';
import { Auth, User, user } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { BreadcrumbService } from 'xng-breadcrumb';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  darkMode = signal<boolean>(false);
  private auth: Auth = inject(Auth);
  user$ = user(this.auth);
  userSubscription!: Subscription;

  @HostBinding('class.dark') get mode() {
    return this.darkMode();
  }

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router
  ) {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      if (!aUser) this.router.navigate(['/login']);
    });
  }

  ngOnInit(): void {
    this.breadcrumbService.set('@Student', 'Student');
    this.breadcrumbService.set('@Home', 'Home');
  }
}
