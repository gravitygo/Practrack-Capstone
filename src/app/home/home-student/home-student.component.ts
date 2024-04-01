import { Component, inject } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { LoadingService } from '../../services/loading.service';

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
  studentName = '';
  ojtPhase = '';
  companyInfo = {
    company: 'N/A',
    startDate: 'N/A',
    endDate: 'N/A',
  };

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

  constructor(
    private homeServ: HomeService,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.getStudentHome();
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
          if (this.ojtPhase !== 'Pre-Deployment') {
            this.companyInfo.company = response[0].companyName;
            this.companyInfo.startDate = response[0].startDate;
            this.companyInfo.endDate = response[0].endDate;
          }
          this.pendingSubmissions = response[1].pending_submissions_count;
          this.unreadMessages = response[2].unread_messages_count;

          /* LOGS 
          console.log(this.userLogged.currentUser!.uid!);
          console.log(this.studentID);
          console.log(this.studentName);
          console.log(this.ojtPhase);
          console.log(this.pendingSubmissions);
          console.log(this.unreadMessages);
          console.log(this.companyInfo); */
        });
    } catch (err) {
      console.log('Error: ', err);
    } finally {
      this.loadingService.hideLoading();
    }
  }
}
