import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
  shortNav: boolean = false;
  navLocation: string = '';
  private auth: Auth = inject(Auth);
  userID?: string;
  role: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(private route: ActivatedRoute) {
    this.navLocation = this.route.snapshot.data['navLoc'];
    console.log(this.navLocation);

    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.userID = user.uid;
      }
    });

    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });
  }

  toggleNav() {
    this.shortNav = !this.shortNav;
  }

  logout() {
    this.auth.signOut();
  }
}
