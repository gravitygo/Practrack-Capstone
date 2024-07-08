import { Component, inject, ViewChild } from '@angular/core';
import { CompanyEvalService } from '../services/company-evaluations.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { MatPaginator } from '@angular/material/paginator';
import { TermService } from '../services/term.service';

@Component({
  selector: 'app-company-evaluations',
  templateUrl: './company-evaluations.component.html',
  styleUrls: ['./company-evaluations.component.scss'],
})
export class CompanyEvaluationsComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private auth: Auth = inject(Auth);
  userLogged = this.auth;

  termRow: any = [];
  term: number = 0;
  termVal: string = '';
  termString: string = '';

  grades: number[] = [];
  relevance: number[] = [];
  scope: number[] = [];
  dev: number[] = [];

  numStudents: number = 0;
  evalCounts: number = 0;
  evalRatio: number[] = [];

  evalStats: any = {};
  chartBatches: string[] = [];
  chartVals: number[] = [];
  chartLimit: number = 9;

  constructor(
    private companyEvalServ: CompanyEvalService,
    private router: Router,
    private loadingService: LoadingService,
    private termServ: TermService
  ) {}

  ngOnInit(): void {
    this.getCompanyEvalsData();
  }

  getCompanyEvalsData(): void {
    try {
      this.loadingService.showLoading();
      this.termServ.getCurrentTerm().subscribe((response) => {
        this.termRow = response;
        this.term = this.termRow.lookupID;
        this.termVal = this.termRow.value;
        this.termString = `A.Y. 20${this.termVal.slice(
          2,
          4
        )}-20${this.termVal.slice(5, 7)}, Term ${this.termVal.slice(9)}`;

        this.companyEvalServ
          .getCompanyEvalsData(this.term)
          .subscribe((response) => {
            // Evaluation Scores
            this.grades = response[0];
            this.relevance = [
              this.grades[0],
              Number((100 - this.grades[0]).toFixed(2)),
            ];
            this.scope = [
              this.grades[1],
              Number((100 - this.grades[1]).toFixed(2)),
            ];
            this.dev = [
              this.grades[2],
              Number((100 - this.grades[2]).toFixed(2)),
            ];

            // Evaluation Respondents
            this.numStudents = response[1].post_deployment_interns;
            this.evalCounts = response[2];
            this.evalRatio = [
              this.evalCounts,
              this.numStudents - this.evalCounts < 0
                ? 0
                : this.numStudents - this.evalCounts,
            ];

            // Overall Evaluations
            this.evalStats = response[3].stats;
            if (this.chartLimit > this.evalStats.length) {
              this.chartLimit = this.evalStats.length;
            }
            for (var i = this.chartLimit - 1; i >= 0; i--) {
              this.chartBatches.push(this.evalStats[i].acadTerm);
              this.chartVals.push(this.evalStats[i].count);
            }

            this.loadingService.hideLoading();
          });
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Calculate the indices of the rows that should be visible based on the paginator's pageIndex and pageSize
  getVisibleIndices(): number[] {
    const startIndex = this.paginator?.pageIndex * this.paginator?.pageSize;
    const endIndex = startIndex + this.paginator?.pageSize;
    return Array.from(
      { length: this.evalStats.length },
      (_, index) => index
    ).slice(startIndex, endIndex);
  }
}
