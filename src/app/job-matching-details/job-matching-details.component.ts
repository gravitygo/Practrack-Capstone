import { Component, inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AccountService } from '../services/account.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-job-matching-details',
  templateUrl: './job-matching-details.component.html',
  styleUrls: ['./job-matching-details.component.scss'],
})
export class JobMatchingDetailsComponent {
  constructor(
    public router: Router,
    private accountService: AccountService
  ) {
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });
  }
  student: any;
  criteriaRank: any;
  criteriaFactors = [
    'Relevance',
    'Scope of Work',
    'Career Development',
    'Location',
    'Setup Type',
    'Field of Industry',
    'Allowance',
  ];
  criteriaList: any[] = Array(7).fill(null);
  companies: any;
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;
  role: BehaviorSubject<string> = new BehaviorSubject('');

  ngOnInit() {
    this.userID = this.userLogged.currentUser?.uid!;
    const currentState = this.router.lastSuccessfulNavigation;
    this.student = currentState?.extras?.state?.['student'];
    this.companies = currentState?.extras?.state?.['rankedCompanies'];
    this.accountService.getCriteria(this.student.userID).subscribe((res) => {
      this.criteriaRank = res.rows[0].prefRank;

      if (this.criteriaRank != null) {
        for (let i = 0; i < this.criteriaRank.length; i++) {
          this.criteriaList[this.criteriaRank[i] - 1] = this.criteriaFactors[i];
        }
      }
    });
  }
}
