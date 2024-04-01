import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, Validators } from '@angular/forms';

import {} from '@angular/fire/functions';

import { DeploymentStage } from 'src/typings';
import { LoadingService } from '../../../services/loading.service';
import { AccountService } from '../../../services/account.service';
import { DocumentService } from 'src/app/services/document.service';
import { CompanyListingService } from '../../../services/company-listing.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
})
export class StudentsComponent {
  private auth: Auth = inject(Auth);
  userLogged = this.auth;

  students: any[] = [];
  uncheckedDocs: any[] = [];

  idNum = 0;
  isModalOpen = false;

  detailsForm = this.fb.group({
    addStartDate: ['', [Validators.required]],
    addEndDate: ['', [Validators.required]],
    addCompany: ['', [Validators.required]],
  });
  submitted = false;
  studentUserID: string = '';

  companies: any[] = [];

  constructor(
    private loadingService: LoadingService,
    private accountService: AccountService,
    private fb: FormBuilder,
    private companyService: CompanyListingService,
    private documentService: DocumentService
  ) {
    this.loadingService.showLoading();
    this.accountService.getUsersWithPhase().subscribe((response) => {
      this.students = response.users;
      this.uncheckedDocs = response.unchecked;
      console.log(this.students);
      this.students.forEach((student) => {
        student['unchecked'] = 0;
        this.uncheckedDocs.forEach((doc) => {
          if (student.createdBy == doc.createdBy) {
            student['unchecked']++;
          }
        });
      });
      this.loadingService.hideLoading();
    });
  }

  ngOnInit() {}

  toggleModal(idNum: number, isModalOpen?: boolean, userID?: string) {
    if (userID) {
      this.studentUserID = userID;
      this.companyService
        .viewCompanyList(this.userLogged.currentUser!.uid!)
        .subscribe((res) => {
          this.companies = res.companylist;
        });
    }
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;
  }

  saveStudentDetails(userID: string) {
    this.submitted = true;
    try {
      if (this.detailsForm.valid) {
        this.documentService
          .saveDeployment(
            userID,
            this.detailsForm.value['addStartDate']
              ? new Date(this.detailsForm.value['addStartDate'])
              : new Date(),
            this.detailsForm.value['addEndDate']
              ? new Date(this.detailsForm.value['addEndDate'])
              : new Date(),
            Number(this.detailsForm.get('addCompany')?.value!)
          )
          .subscribe(() => {
            window.location.reload();
          });
      }
    } catch (err) {
      console.log('Error: ', err);
    }
  }
}
