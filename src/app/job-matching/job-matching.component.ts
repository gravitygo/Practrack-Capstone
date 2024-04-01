import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { NavigationExtras, Router } from '@angular/router';
import { JobMatchingService } from '../services/job-matching.service';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-job-matching',
  templateUrl: './job-matching.component.html',
  styleUrls: ['./job-matching.component.scss'],
})
export class JobMatchingComponent {
  // User Logged
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;
  companySheets: any;
  filteredSheets: any[] = [];
  companyDB: any;
  studentDB: any;
  f2fWeights: any[] = [];
  defaultWeights: any[] = [0.2083, 0.1667, 0.1667, 0.125, 0.125, 0.2083];
  companiesScores: { [key: string]: any } = {};
  studentsCompanyScores: { [key: string]: any } = {};
  companyScore: any[] = [];
  runningTotal = 0;

  constructor(
    private jobServ: JobMatchingService,
    public router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;
    this.loadingService.showLoading();
    this.jobServ.getCompanySheets().subscribe((response) => {
      console.log(response);
      this.companySheets = response.companySheets;
      this.companyDB = response.companyDB;
      this.studentDB = response.studentDB;
      this.computeMFEP();
      this.loadingService.hideLoading();
    });
  }
  computeMFEP(): void {
    // Initialize studentsCompanyScores as an empty object
    this.studentsCompanyScores = {};

    var moreRows;
    var lessRows;

    // Filter if company is in sheets and in db
    if (this.companySheets.length > this.companyDB.length) {
      moreRows = this.companySheets;
      lessRows = this.companyDB;
    } else {
      moreRows = this.companyDB;
      lessRows = this.companySheets;
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
            lessRows[j]['dbData'] = moreRows[i];
            this.filteredSheets.push(lessRows[j]);
          } else {
            moreRows[i]['dbData'] = lessRows[j];

            this.filteredSheets.push(moreRows[i]);
          }
        }
      }
    }
    console.log(this.filteredSheets);

    // Quantify generic company data
    for (let i = 0; i < this.filteredSheets.length; i++) {
      // Scores from sheets
      var key = this.filteredSheets[i][0];
      // Normalize values
      var nRelevance = this.filteredSheets[i][6] * this.defaultWeights[0];
      var nScope = this.filteredSheets[i][10] * this.defaultWeights[1];
      var nCareer = this.filteredSheets[i][12] * this.defaultWeights[2];
      this.companyScore = [];
      this.companiesScores[key] = [];
      this.companyScore.push(nRelevance);
      this.companyScore.push(nScope);
      this.companyScore.push(nCareer);
      this.companiesScores[key].push(this.companyScore);
    }

    // Quantify student data
    this.studentDB.forEach((student: any) => {
      var studentID = student.studentID;
      var studentRegion = student.addrRegion;
      var studentProvince = student.addrProvince;
      var studentCity = student.addrCity;
      var studentSetup = student.workSetup;
      var studentField = student.fieldID;

      // Initialize an empty object to hold scores for each student
      this.studentsCompanyScores[studentID] = {};
      // Reset additional properties
      student['recField'] = '';
      student['recCompany'] = '';
      student['companyRate'] = '';

      // Quantify specific company data
      for (let i = 0; i < this.filteredSheets.length; i++) {
        var companyRegion = this.filteredSheets[i].dbData.addrRegion;
        var companyProvince = this.filteredSheets[i].dbData.addrProvince;
        var companyCity = this.filteredSheets[i].dbData.addrCity;

        var key = this.filteredSheets[i].dbData.companyName;

        // Initialize an empty object to hold scores for each company for this student
        this.studentsCompanyScores[studentID][key] = [];

        var locScore = 1;
        var setupScore = 1;
        var fieldScore = 1;

        // Location score calculation
        if (companyCity === studentCity) {
          locScore = 4;
        } else if (companyProvince === studentProvince) {
          locScore = 3;
        } else if (companyRegion === studentRegion) {
          locScore = 2;
        }

        // Setup score calculation
        if (studentSetup === this.filteredSheets[i].dbData.worksetupstr) {
          setupScore = 4;
        } else if (studentSetup === 'Any') {
          setupScore = 2;
        }

        // Field score calculation
        var companyField = this.filteredSheets[i].dbData.natureOfCompany;
        if (studentField == companyField) {
          fieldScore = 4;
        } else if (
          (studentField == 1 || studentField == 2) &&
          (companyField == 1 || companyField == 2)
        ) {
          fieldScore = 2;
        } else if (
          (studentField == 3 || studentField == 4) &&
          (companyField == 3 || companyField == 4)
        ) {
          fieldScore = 2;
        } else if (
          (studentField == 5 || studentField == 6) &&
          (companyField == 5 || companyField == 6)
        ) {
          fieldScore = 2;
        }

        // Assign normalized scores to the object
        this.studentsCompanyScores[studentID][key]['locScore'] =
          locScore * this.defaultWeights[3];
        this.studentsCompanyScores[studentID][key]['setupScore'] =
          setupScore * this.defaultWeights[4];
        this.studentsCompanyScores[studentID][key]['fieldScore'] =
          fieldScore * this.defaultWeights[5];
        this.runningTotal = 0;
        this.runningTotal = nRelevance + nScope + nCareer;
        this.runningTotal +=
          this.studentsCompanyScores[studentID][key]['locScore'];
        this.runningTotal +=
          this.studentsCompanyScores[studentID][key]['setupScore'];
        this.runningTotal +=
          this.studentsCompanyScores[studentID][key]['fieldScore'];

        this.studentsCompanyScores[studentID][key].push(
          this.companiesScores[key]
        );
        this.studentsCompanyScores[studentID][key].push(this.runningTotal);
      }
      this.studentsCompanyScores[studentID] = this.rankCompanies(
        this.studentsCompanyScores[studentID]
      );
      // this.studentsCompanyScores[studentID] = this.rankCompanies(
      //   this.studentsCompanyScores[studentID]
      // );

      student['recField'] = '';
      student['recCompany'] = this.studentsCompanyScores[studentID][0][0];
      var convRate = (
        (this.studentsCompanyScores[studentID][0][1][1] / 4) *
        100
      ).toFixed(2);
      student['companyRate'] = convRate;
    });

    console.log(this.studentsCompanyScores);
  }
  rankCompanies(companyList: any): Array<any[]> {
    // Convert companyList to an array if it's an object
    const companiesArray = Array.isArray(companyList)
      ? companyList
      : Object.entries(companyList).map(([companyName, value]) => [
          companyName,
          value,
        ]);

    // Sort the company list in descending order based on the value you're accessing
    companiesArray.sort(([, a], [, b]) => b[1] - a[1]);

    // console.log(companiesArray);
    return companiesArray;
  }

  viewDetails(studentID: number): void {
    var student = [];
    for (let m = 0; m < this.studentDB.length; m++) {
      if (studentID == this.studentDB[m].studentID) {
        student = this.studentDB[m];
      }
    }

    var data: NavigationExtras = {
      state: {
        student: student,
        rankedCompanies: this.studentsCompanyScores[studentID],
      },
    };
    this.router.navigate(['jobMatching/details'], data);
  }
}
