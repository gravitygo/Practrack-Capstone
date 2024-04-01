import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-job-matching-details',
  templateUrl: './job-matching-details.component.html',
  styleUrls: ['./job-matching-details.component.scss'],
})
export class JobMatchingDetailsComponent {
  constructor(public router: Router) {}
  student: any;
  companies: any;

  ngOnInit() {
    const currentState = this.router.lastSuccessfulNavigation;
    this.student = currentState?.extras?.state?.['student'];
    this.companies = currentState?.extras?.state?.['rankedCompanies'];

    console.log(this.student);
    console.log(this.companies);
  }
}
