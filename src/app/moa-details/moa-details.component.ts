import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MoadssService } from '../services/moadss.service';
import { LoadingService } from '../services/loading.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-moa-details',
  templateUrl: './moa-details.component.html',
  styleUrls: ['./moa-details.component.scss'],
})
export class MoaDetailsComponent {
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  coorID: any;
  companyParam: any;
  company: any[] = [];
  companyDB: any;
  surveyCounts: number[] = [];
  weights: number[] = [];
  matrix: number[][] = [];
  data: any;
  radarData: number[][] = [];
  barData: number[][] = [];

  constructor(
    private moadssServ: MoadssService,
    private loadingService: LoadingService,
    private route: ActivatedRoute
  ) {
    console.log('IN MOA DETAILS COMPONENT=========================');
  }

  ngOnInit(): void {
    this.coorID = this.userLogged.currentUser?.uid!;
    console.log('COOR ID: ' + this.coorID);
    this.companyParam = this.route.snapshot.paramMap.get('company');
    console.log('THIS COMPANY: ' + this.companyParam);
    this.getRow(this.coorID, this.companyParam);
  }

  getRow(coorID: string, company: string): void {
    this.loadingService.showLoading();
    this.moadssServ.getRow(coorID, company).subscribe((response) => {
      this.company = response.company;
      this.companyDB = response.companyDB[0];
      this.surveyCounts = response.counts;

      // For charts
      this.data = response.data;
      this.weights = this.data.criteriaRankMetaMap.weightedVector;
      this.matrix = this.data.rankingMatrix;

      for (let i = 0; i < 2; i++) {
        var set1 = [];
        for (let j = 0; j < 3; j++) {
          var product = this.weights[j] * this.matrix[i][j];
          set1.push(product);
        }
        this.radarData.push(set1);
      }
      console.log(this.radarData);

      for (let i = 0; i < 3; i++) {
        var set2 = [];
        for (let j = 0; j < 2; j++) {
          set2.push(this.radarData[j][i]);
        }
        this.barData.push(set2);
      }
      /*
      console.log('GETROW=======================');
      console.log(this.company);
      console.log(this.companyDB);
      console.log(this.surveyCounts);
      console.log(this.data);
      console.log(this.radarData);
      console.log(this.barData);
*/
      this.loadingService.hideLoading();
    });
  }
  isPastDate(dateString: string): boolean {
    const today = new Date();
    const endDate = new Date(dateString);
    return endDate < today;
  }
}
