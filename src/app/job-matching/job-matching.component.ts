import { Component, ViewChild, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { NavigationExtras, Router } from '@angular/router';
import { JobMatchingService } from '../services/job-matching.service';
import { LoadingService } from '../services/loading.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
@Component({
  selector: 'app-job-matching',
  templateUrl: './job-matching.component.html',
  styleUrls: ['./job-matching.component.scss'],
})
export class JobMatchingComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // User Logged
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;
  companySheets: any;
  filteredSheets: any[] = [];
  companyDB: any;
  studentDB: any;
  defaultWeights: any[] = [0.1, 0.13, 0.12, 0.14, 0.15, 0.2, 0.16];
  // Relev,  Scope,  Career,  Loc,   Setup,  Field,  Paid
  companiesScores: { [key: string]: any } = {};
  studentsCompanyScores: { [key: string]: any } = {};
  companyScore: any[] = [];
  runningTotal = 0;

  // Paginator Variables
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // SEARCH FILTER FUNCTION
  searchText: any;
  filteredStudentDB: any[] = [];

  constructor(
    private jobServ: JobMatchingService,
    public router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;
    this.loadingService.showLoading();
    this.jobServ.getCompanySheets().subscribe((response) => {
      this.companySheets = response.companySheets;
      this.companyDB = response.companyDB;
      this.studentDB = response.studentDB;
      this.filterData();
      this.computeMFEP();
      this.loadingService.hideLoading();
    });
  }

  ngOnChanges(): void {
    this.filterData();
  }

  // SEARCH Filter function NEWLY ADDED
  filterData(): void {
    const searchKeys = [
      'firstName',
      'lastName',
      'fieldName',
      'recCompany',
      'companyRate',
    ];
    if (!this.searchText) {
      this.filteredStudentDB = this.studentDB.slice();
    } else {
      this.filteredStudentDB = this.studentDB.filter((student: any) =>
        searchKeys.some(
          (key) =>
            student[key]
              ?.toString()
              .toLowerCase()
              .includes(this.searchText.toLowerCase())
        )
      );
    }
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

    // Quantify student data
    this.studentDB.forEach((student: any) => {
      var studentID = student.studentID;
      var studentRegion = student.addrRegion;
      var studentProvince = student.addrProvince;
      var studentCity = student.addrCity;
      var studentSetup = student.workSetup;
      var studentField = student.fieldID;
      var studentAllowance = student.allowance;
      var studentWeights: number[] = [];

      // Determine if criteria is custom/default
      if (student.prefRank == null) {
        studentWeights = this.defaultWeights;
      } else {
        // Convert prefRank to weights
        console.log('Meron');
        student.prefRank.forEach((pref: number) => {
          switch (pref) {
            case 1:
              studentWeights.push(0.2);
              break;
            case 2:
              studentWeights.push(0.16);
              break;
            case 3:
              studentWeights.push(0.15);
              break;
            case 4:
              studentWeights.push(0.14);
              break;
            case 5:
              studentWeights.push(0.13);
              break;
            case 6:
              studentWeights.push(0.12);
              break;
            case 7:
              studentWeights.push(0.1);
              break;
            default:
              break;
          }
        });
      }

      // Initialize an empty object to hold scores for each student
      this.studentsCompanyScores[studentID] = {};
      // Reset additional properties
      student['recField'] = '';
      student['recCompany'] = '';
      student['companyRate'] = '';

      // Quantify  company data
      this.companiesScores = [];
      for (let i = 0; i < this.filteredSheets.length; i++) {
        // Scores from sheets
        var key = this.filteredSheets[i][0];
        // Normalize values
        var nRelevance = this.filteredSheets[i][6] * studentWeights[0];
        var nScope = this.filteredSheets[i][10] * studentWeights[1];
        var nCareer = this.filteredSheets[i][12] * studentWeights[2];
        this.companyScore = [];
        this.companiesScores[key] = [];
        this.companyScore.push(nRelevance);
        this.companyScore.push(nScope);
        this.companyScore.push(nCareer);
        this.companiesScores[key].push(this.companyScore);

        var companyRegion = this.filteredSheets[i].dbData.addrRegion;
        var companyProvince = this.filteredSheets[i].dbData.addrProvince;
        var companyCity = this.filteredSheets[i].dbData.addrCity;
        var companyAllowance = this.filteredSheets[i].dbData.hasAllowance;

        var key = this.filteredSheets[i].dbData.companyName;

        // Initialize an empty object to hold scores for each company for this student
        this.studentsCompanyScores[studentID][key] = [];

        var locScore = 1;
        var setupScore = 1;
        var fieldScore = 1;
        var paidScore = 1;

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

        // Allowance score calculation
        if (
          (studentAllowance == 1 && companyAllowance == true) ||
          (studentAllowance == 2 && companyAllowance == false)
        ) {
          paidScore = 4;
        } else if (studentAllowance == 3 && companyAllowance == true) {
          paidScore = 3;
        } else if (studentAllowance == 3 && companyAllowance == false) {
          paidScore = 2;
        }

        // Assign normalized scores to the object
        this.studentsCompanyScores[studentID][key]['locScore'] =
          locScore * studentWeights[3];
        this.studentsCompanyScores[studentID][key]['setupScore'] =
          setupScore * studentWeights[4];
        this.studentsCompanyScores[studentID][key]['fieldScore'] =
          fieldScore * studentWeights[5];
        this.studentsCompanyScores[studentID][key]['paidScore'] =
          paidScore * studentWeights[6];

        // Sum scores
        this.runningTotal = 0;
        this.runningTotal =
          this.companiesScores[key][0][0] +
          this.companiesScores[key][0][1] +
          this.companiesScores[key][0][2];
        this.runningTotal +=
          this.studentsCompanyScores[studentID][key]['locScore'];
        this.runningTotal +=
          this.studentsCompanyScores[studentID][key]['setupScore'];
        this.runningTotal +=
          this.studentsCompanyScores[studentID][key]['fieldScore'];
        this.runningTotal +=
          this.studentsCompanyScores[studentID][key]['paidScore'];

        this.studentsCompanyScores[studentID][key].push(
          this.companiesScores[key]
        );
        this.studentsCompanyScores[studentID][key].push(this.runningTotal);
      }
      this.studentsCompanyScores[studentID] = this.rankCompanies(
        this.studentsCompanyScores[studentID]
      );

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

    // Only return top 10 companies
    if (companiesArray.length > 10) {
      companiesArray.splice(10);
    }

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

  getVisibleIndices(): number[] {
    const startIndex = this.paginator?.pageIndex * this.paginator?.pageSize;
    const endIndex = startIndex + this.paginator?.pageSize;
    return Array.from(
      { length: this.filteredStudentDB.length },
      (_, index) => index
    ).slice(startIndex, endIndex);
  }
}
