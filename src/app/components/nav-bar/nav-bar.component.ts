import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';
import { HomeService } from '../../services/home.service';

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
  announcementVal: number = 0;
  docsVal: number = 0;
  inboxVal: number = 0;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private homeService: HomeService
  ) {
    this.navLocation = this.route.snapshot.data['navLoc'];

    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.userID = user.uid;
      }
    });

    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });

    // SETUP NOTIF VALUES
    this.getNotifs();

    // LISTENER
    this.supabaseService.getNotifs().subscribe(() => {
      this.getNotifs();
    });
  }

  getNotifs() {
    this.homeService
      .getNotifs(this.auth.currentUser!.uid!)
      .subscribe((counts) => {
        this.announcementVal = counts.announcements;
        this.docsVal = counts.docs;
        this.inboxVal = counts.inbox;
      });
  }

  toggleNav() {
    this.shortNav = !this.shortNav;
  }

  logout() {
    this.auth.signOut();
  }
}
