import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { onTokenChanged } from 'firebase/app-check';
import { RemarksColor, RemarksIcon } from 'src/app/enum/deployment-color.enum';
import { KeyValue } from 'src/app/model/manifest.model';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AccountService } from 'src/app/services/account.service';
import { DocumentService } from 'src/app/services/document.service';
import { ManifestService } from 'src/app/services/manifest.service';
import { RemarksStatus } from 'src/typings';
import { BreadcrumbService } from 'xng-breadcrumb';
import { FormBuilder, Validators } from '@angular/forms';
import { CompanyListingService } from '../../../services/company-listing.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
@Component({
  selector: 'app-student-documents',
  templateUrl: './student-documents.component.html',
  styleUrls: ['./student-documents.component.scss'],
})
export class StudentDocumentsComponent {
  id = this.route.snapshot.paramMap.get('id');
  fullName: string = '-';
  steps!: KeyValue[];
  remarksColor = RemarksColor;
  remarksIcon = RemarksIcon;
  acadTerm!: number;
  ojtPhase!: number;
  documentRequirements: {
    requirement: string;
    version: string | undefined | null;
    dueDate: Date | undefined | null;
    submittedOn: Date | undefined | null;
    status: RemarksStatus;
    documentID: number | undefined | null;
    acadTermFileID: any;
    isFileSubmission: boolean;
    Requirement: string | undefined | null;
  }[] = [];
  requestForm = this.fb.group({
    reason: { value: '', disabled: true },
  });
  decision: string = '';
  submitted = false;
  requested = false;
  startDate: any;
  endDate: any;
  formattedStartDate: any;
  formattedEndDate: any;
  supvName: any;
  supvEmail: any;
  companyID: any;
  company: any;
  companies: any[] = [];
  hoursRendered: number = 0;
  hoursRequired: number = 0;
  idNum = 0;
  isModalOpen = false;
  detailsForm = this.fb.group({
    addStartDate: ['', [Validators.required]],
    addEndDate: ['', [Validators.required]],
    addCompany: ['', [Validators.required]],
    addSupvName: ['', [Validators.required]],
    addSupvEmail: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private breadcrumbService: BreadcrumbService,
    private accountService: AccountService,
    private manifestService: ManifestService,
    private documentService: DocumentService,
    private companyService: CompanyListingService,
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private snack: SnackbarService
  ) {
    this.viewStudentDocuments();

    // LISTENER
    this.supabaseService.getDocuHub().subscribe(() => {
      this.viewStudentDocuments();
    });
  }

  viewStudentDocuments() {
    this.manifestService.getOptions('ojtPhase').subscribe((value) => {
      this.steps = value;
      this.accountService
        .getCurrentUsersWithPhase(this.id!)
        .subscribe((value) => {
          this.fullName = value['fullName'];
          this.breadcrumbService.set(
            '@studentFileExplorer',
            `${value['fullName']}'${
              value['fullName'].charAt(value['fullName'].length - 1) == 's'
                ? ''
                : 's'
            } Submission`
          );
          this.acadTerm = value['acadTermID'];
          this.ojtPhase = value['ojtPhaseID'];
          this.startDate = value['startDate'];
          this.endDate = value['endDate'];
          this.formattedStartDate = value['formattedStartDate'];
          this.formattedEndDate = value['formattedEndDate'];
          this.supvName = value['supvName'];
          this.supvEmail = value['supvEmail'];
          this.companyID = value['companyID'];
          this.company = value['companyName'];
          this.hoursRendered = value['hoursRendered'];
          this.hoursRequired = value['hours'];

          if (value['requestMigrate'] == true) {
            this.requested = true;
            this.requestForm
              .get('reason')
              ?.setValue(value['reasonForMigration']);
          }
          this.getRequirements();
        });
    });
  }

  submitDecision() {
    this.submitted = true;
    if (this.decision) {
      this.documentService
        .decisionMigrate(this.id!, this.decision)
        .subscribe(() => {
          this.viewStudentDocuments();
          this.snack.openSnackBar(
            'Request decision has been saved.',
            '',
            'Success'
          );
        });
    }
  }

  changePhase(ojtPhase: number) {
    this.ojtPhase = ojtPhase;
    this.getRequirements();
  }

  getRequirements() {
    this.documentService
      .getSubmittedDocumentCoordinator(this.id!, this.ojtPhase, this.acadTerm)
      .subscribe((value) => {
        this.documentRequirements = value;
      });
  }

  toggleModal(idNum: number, isModalOpen?: boolean) {
    this.companyService.viewCompanyList(this.id!).subscribe((res) => {
      this.companies = res.companylist;
    });
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;
    this.viewStudentDetails();
  }

  viewStudentDetails() {
    // Edit details
    if (this.idNum == 1) {
      this.detailsForm.enable();
      this.detailsForm.patchValue({
        addStartDate: this.startDate,
        addEndDate: this.endDate,
        addSupvName: this.supvName,
        addSupvEmail: this.supvEmail,
      });
      this.detailsForm.get('addCompany')?.setValue(this.companyID);
    }
    // Reset details
    else if (this.idNum == 2) {
      this.detailsForm.patchValue({
        addStartDate: this.startDate,
        addEndDate: this.endDate,
        addSupvName: this.supvName,
        addSupvEmail: this.supvEmail,
      });

      this.detailsForm.get('addCompany')?.setValue(this.companyID);
      this.detailsForm.controls['addStartDate'].disable();
      this.detailsForm.controls['addEndDate'].disable();
      this.detailsForm.controls['addSupvName'].disable();
      this.detailsForm.controls['addSupvEmail'].disable();
      this.detailsForm.controls['addCompany'].disable();
    }
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
            Number(this.detailsForm.get('addCompany')?.value!),
            this.detailsForm.get('addSupvName')?.value!,
            this.detailsForm.get('addSupvEmail')?.value!
          )
          .subscribe(() => {
            this.toggleModal(1, false);
            this.viewStudentDocuments();
            this.snack.openSnackBar(
              'Student details successfully updated.',
              '',
              'Success'
            );
          });
      }
    } catch (err) {
      console.error(err);
    }
  }

  resetStudentDetails(userID: string) {
    try {
      this.documentService.resetDeployment(userID).subscribe(() => {
        this.toggleModal(2, false);
        this.viewStudentDocuments();
        this.snack.openSnackBar(
          'Student details successfully reset.',
          '',
          'Info'
        );
        this.detailsForm.reset();
        this.detailsForm.enable();
        this.submitted = false;
      });
    } catch (err) {
      console.error(err);
    }
  }

  toRequirements() {
    const data: NavigationExtras = {
      state: {
        data: { tab: 'requirements' },
      },
    };
    this.router.navigate(['/documentHub/coordinator'], data);
  }
}
