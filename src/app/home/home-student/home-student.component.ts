import { Component, inject } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { LoadingService } from '../../services/loading.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-home-student',
  templateUrl: './home-student.component.html',
  styleUrls: ['./home-student.component.scss'],
})
export class HomeStudentComponent {
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  term: string = 'AY23-24 T2';

  studentID = 0;
  studentName: string = '';
  ojtPhase: string = '';
  company: any;
  startDate: any;
  endDate: any;
  hoursRendered: number = 0;
  hoursRequired: number = 0;

  pendingSubmissions = 0;
  unreadMessages = 0;

  datetimeNow = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZoneName: 'short',
  }).format(new Date());

  requested = false;
  approved = false;

  deadlineAlerts: any[] = [];
  almostDue: boolean = false;
  almostDueStr: string = '';
  overdue: boolean = false;

  constructor(
    private homeServ: HomeService,
    private router: Router,
    private loadingService: LoadingService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.getStudentHome();

    // LISTENER
    this.supabaseService.getNotifs().subscribe(() => {
      this.getStudentHome();
    });
  }

  getStudentHome() {
    try {
      this.loadingService.showLoading();
      this.homeServ
        .getStudentHome(this.userLogged.currentUser!.uid!)
        .subscribe((response) => {
          this.studentID = response[0].studentID;
          this.studentName = response[0].firstName;
          this.ojtPhase = response[0].ojtPhase;
          this.company = response[0].companyName;
          this.startDate = response[0].startDate;
          this.endDate = response[0].endDate;
          this.hoursRendered = response[0].hoursRendered;
          this.hoursRequired = response[0].hours;

          this.pendingSubmissions = response[1].pending_submissions_count;
          this.unreadMessages = response[2].unread_messages_count;

          this.requested = response[0].requestMigrate;
          this.approved = response[3].exists;

          // DEADLINE ALERTS
          this.deadlineAlerts = response[4];

          switch (this.deadlineAlerts.length) {
            case 2: // Both overdue and almostDue
              this.overdue = true;
              this.almostDueAlert(this.deadlineAlerts[1].date_diff);
              break;
            case 1: // Either overdue or almostDue
              if (this.deadlineAlerts[0].date_diff < 0) {
                // overdue
                this.overdue = true;
                this.almostDue = false;
              } else {
                // almostDue
                this.overdue = false;
                this.almostDueAlert(this.deadlineAlerts[0].date_diff);
              }
              break;
            default: // Neither
              this.overdue = false;
              this.almostDue = false;
          }
        });
    } catch (err) {
      console.error(err);
    } finally {
      this.loadingService.hideLoading();
    }
  }

  // DEADLINE ALERTS
  almostDueAlert(val: number) {
    this.almostDue = true;

    switch (val) {
      case 0:
        this.almostDueStr = 'less than a day';
        break;
      case 1:
        this.almostDueStr = '1 day';
        break;
      default:
        this.almostDueStr = val + ' days';
    }
  }
}
