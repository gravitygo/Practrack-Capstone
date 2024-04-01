import { Component, inject, ViewChild, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MoadssService } from '../services/moadss.service';
import { Auth } from '@angular/fire/auth';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-moa-dss',
  templateUrl: './moa-dss.component.html',
  styleUrls: ['./moa-dss.component.scss'],
})
export class MoaDSSComponent {
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  coorID: any;
  configChecker = false;
  allCompaniesDB: any[] = [];
  allCompaniesSheets: any[] = [];
  companies: any[] = [];
  nonMatched: any[] = [];
  filteredCompanies: any[] = [];

  constructor(
    private moadssServ: MoadssService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.coorID = this.userLogged.currentUser?.uid!;
    this.viewMOA(this.coorID);
  }

  viewMOA(coorID: string): void {
    this.loadingService.showLoading();
    this.moadssServ.viewMOA(coorID).subscribe((response) => {
      console.log(response);
      this.allCompaniesDB = response.companyDB;
      if (response.data[0]?.q1 != null) {
        this.configChecker = true;
        this.moadssServ.getCompanies(coorID).subscribe((response) => {
          this.allCompaniesSheets = response.companies;
          console.log(this.allCompaniesSheets);
          var moreRows: any[] = [];
          var lessRows: any[] = [];

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
                  console.log(moreRows[i]);
                  moreRows[i]['sheetData'] = lessRows[j];
                  this.companies.push(moreRows[i]);
                } else {
                  lessRows[j]['sheetData'] = moreRows[i];
                  this.companies.push(lessRows[j]);
                }
              }
            }
          }
          // If moreRows is bigger, assume there are companies not yet in this.companies
          if (moreRows[0][0] == null) {
            let isMatchFound = false; // Flag to track if a match is found
            for (let i = 0; i < moreRows.length; i++) {
              var outerKey = moreRows[i].companyName;
              console.log('OUTER=========');
              for (let j = 0; j < this.companies.length; j++) {
                var innerKey = this.companies[j].companyName;
                // Compare company names
                if (outerKey == innerKey) {
                  isMatchFound = true;
                  break; // Exit the inner loop if match found
                }
              }
              // If no match found, push moreRows[i] and exit outer loop
              if (!isMatchFound) {
                console.log(
                  'No match found for ' + outerKey + ', pushing to companies'
                );
                moreRows[i]['sheetData'] = null;
                this.companies.push(moreRows[i]);
              } else {
                console.log('Match found for ' + outerKey);
                isMatchFound = false; // Reset the flag for the next iteration
              }
            }
          }

          console.log(this.companies);
        });
      }
      this.loadingService.hideLoading();
    });
  }

  isPastDate(dateString: string): boolean {
    const today = new Date();
    const endDate = new Date(dateString);
    return endDate < today;
  }
}
