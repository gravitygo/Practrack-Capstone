import { Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  NavigationStart,
  NavigationExtras,
  Router,
} from '@angular/router';
import { MoadssService } from '../services/moadss.service';
import { Auth, User, user } from '@angular/fire/auth';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-moa-configure',
  templateUrl: './moa-configure.component.html',
  styleUrls: ['./moa-configure.component.scss'],
})
export class MoaConfigureComponent {
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private moadssServ: MoadssService,
    private loadingService: LoadingService
  ) {}

  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  coorID: any;
  companies: any[] = [];
  allCompaniesSheets: any[] = [];
  allCompaniesDB: any[] = [];
  companyData: { [key: string]: any } = {};
  q1: string = '';
  q2: string = '';
  q3: string = '';
  questions: string[] = [];
  perCompanyItemRanks: any[] = [];
  itemranks: any[] = [];
  criteriaranks: any[] = [];
  criteriaPair: any[] = [];
  preferredCriteria: any[] = [];

  ngOnInit(): void {
    this.coorID = this.userLogged.currentUser?.uid!;
    this.moadssServ.getCompanies(this.coorID).subscribe((response) => {
      this.allCompaniesSheets = response.companies;
      this.allCompaniesDB = response.companyDB;
      console.log(this.allCompaniesSheets);
      console.log(this.allCompaniesDB);
      var moreRows;
      var lessRows;

      // Filter if company is in sheets and in db
      if (this.allCompaniesSheets.length > this.allCompaniesDB.length) {
        moreRows = this.allCompaniesSheets;
        lessRows = this.allCompaniesDB;
      } else {
        moreRows = this.allCompaniesDB;
        lessRows = this.allCompaniesSheets;
      }

      for (let i = 0; i < moreRows.length; i++) {
        var outerKey;
        if (moreRows[i][0] == null) {
          outerKey = moreRows[i].companyName;
        } else if (moreRows[i].companyName == null) {
          outerKey = moreRows[i][0];
        }
        for (let j = 0; j < lessRows.length; j++) {
          var innerKey;
          if (lessRows[j][0] == null) {
            innerKey = lessRows[j].companyName;
          } else if (lessRows[j].companyName == null) {
            innerKey = lessRows[j][0];
          }
          // Compare company names
          if (outerKey == innerKey) {
            console.log('Match!');
            console.log(outerKey);
            console.log(innerKey);
            // check which is from sheets
            if (moreRows[i][0] == null) {
              this.companies.push(lessRows[j]);
            } else {
              this.companies.push(moreRows[i]);
            }
          }
        }
      }
      console.log(this.companies);
    });
  }
  //this.companies will now be the filtered version of everything
  saveConfiguration() {
    this.questions.push(this.q1, this.q2, this.q3);
    this.criteriaPair = [];
    this.preferredCriteria = [];

    // Setting preferred criteria
    // Q1: Relevance vs Scope of Work
    if (this.q1.charAt(0) == 'a' || this.q1 == 'e') {
      this.criteriaPair.push(['relevance', 'scope']);
    } else if (this.q1.charAt(0) == 'b') {
      this.criteriaPair.push(['scope', 'relevance']);
    }
    // Q2: Relevance vs Career Development
    if (this.q2.charAt(0) == 'a' || this.q2 == 'e') {
      this.criteriaPair.push(['relevance', 'career']);
    } else if (this.q2.charAt(0) == 'b') {
      this.criteriaPair.push(['career', 'relevance']);
    }
    // Q3: Scope of Work vs Career Development
    if (this.q3.charAt(0) == 'a' || this.q3 == 'e') {
      this.criteriaPair.push(['scope', 'career']);
    } else if (this.q3.charAt(0) == 'b') {
      this.criteriaPair.push(['career', 'scope']);
    }
    this.preferredCriteria.push(this.criteriaPair);
    console.log(this.preferredCriteria);

    // Converting question answers into criteria ranks
    this.questions.forEach((q) => {
      if (q == 'a9b' || q == 'b9a') {
        this.criteriaranks.push(9);
      } else if (q == 'a7b' || q == 'b7a') {
        this.criteriaranks.push(7);
      } else if (q == 'a5b' || q == 'b5a') {
        this.criteriaranks.push(5);
      } else if (q == 'a3b' || q == 'b3a') {
        this.criteriaranks.push(3);
      } else if (q == 'e') {
        this.criteriaranks.push(1);
      }
    });

    // Converting company data into item ranks
    // [A <= 3.01]		    1 indicates equal importance
    // [3.01 < A <= 3.34]	3 indicates moderate importance
    // [3.34 < A <= 3.67]	5 indicates strong importance
    // [3.67 < A <= 3.8]	7 indicates very strong importance
    // [3.8 < A <= 4]		  9 indicates extreme importance
    for (let i = 0; i < this.companies.length; i++) {
      this.perCompanyItemRanks = [];
      var key = this.companies[i][0];
      this.companyData[key] = [];
      // relevance
      if (this.companies[i][6]) {
        var val = this.companies[i][6];
        if (val > 3.8) {
          this.perCompanyItemRanks.push(9);
        } else if (val <= 3.8 && val > 3.67) {
          this.perCompanyItemRanks.push(7);
        } else if (val <= 3.67 && val > 3.34) {
          this.perCompanyItemRanks.push(5);
        } else if (val <= 3.34 && val > 3.01) {
          this.perCompanyItemRanks.push(3);
        } else if (val <= 3.01) {
          this.perCompanyItemRanks.push(1);
        }
      }
      // scope
      if (this.companies[i][10]) {
        var val = this.companies[i][10];
        if (val > 3.8) {
          this.perCompanyItemRanks.push(9);
        } else if (val <= 3.8 && val > 3.67) {
          this.perCompanyItemRanks.push(7);
        } else if (val <= 3.67 && val > 3.34) {
          this.perCompanyItemRanks.push(5);
        } else if (val <= 3.34 && val > 3.01) {
          this.perCompanyItemRanks.push(3);
        } else if (val <= 3.01) {
          this.perCompanyItemRanks.push(1);
        }
      }
      // career
      if (this.companies[i][12]) {
        var val = this.companies[i][12];
        if (val > 3.8) {
          this.perCompanyItemRanks.push(9);
        } else if (val <= 3.8 && val > 3.67) {
          this.perCompanyItemRanks.push(7);
        } else if (val <= 3.67 && val > 3.34) {
          this.perCompanyItemRanks.push(5);
        } else if (val <= 3.34 && val > 3.01) {
          this.perCompanyItemRanks.push(3);
        } else if (val <= 3.01) {
          this.perCompanyItemRanks.push(1);
        }
      }
      this.itemranks.push(this.perCompanyItemRanks);
      this.companyData[key].push(this.itemranks[i]);
    }
    console.log(this.companyData);
    this.loadingService.showLoading();
    this.moadssServ
      .checkConfig(this.coorID, {
        q1: this.q1,
        q2: this.q2,
        q3: this.q3,
        itemranks: this.companyData,
        criteriaranks: this.criteriaranks,
        preferredCriteria: this.preferredCriteria,
      })
      .subscribe((response) => {
        var consistencyRatio = 0;
        var key = [];
        key = Object.keys(response.dssArray[0]);
        consistencyRatio = response.dssArray[0][key[0]].criteriaRankMetaMap.cr;
        console.log(response);
        console.log(consistencyRatio);
        this.loadingService.hideLoading();
        if (consistencyRatio > 0.1) {
          console.log('Bawal');
          var data: NavigationExtras = {
            state: {
              cr: consistencyRatio,
            },
          };
          this.router.navigate(['moaDSS/' + this.coorID + '/error'], data);
        } else {
          console.log('Pwede');
          this.moadssServ
            .saveConfig(this.coorID, {
              q1: this.q1,
              q2: this.q2,
              q3: this.q3,
              itemranks: this.companyData,
              criteriaranks: this.criteriaranks,
              preferredCriteria: this.preferredCriteria,
            })
            .subscribe((response) => {
              console.log(response);
              this.loadingService.hideLoading();
              this.router.navigate(['moaDSS/' + this.coorID]);
            });
        }
      });
  }
}
