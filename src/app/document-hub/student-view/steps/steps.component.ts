import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RemarksColor, RemarksIcon } from 'src/app/enum/deployment-color.enum';
import { KeyValue } from 'src/app/model/manifest.model';
import { AccountService } from 'src/app/services/account.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ManifestService } from 'src/app/services/manifest.service';
import { RemarksStatus } from 'src/typings';
import { BreadcrumbService } from 'xng-breadcrumb';
import { FormBuilder, Validators } from '@angular/forms';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss'],
})
export class StepsComponent {
  steps!: KeyValue[];
  documentRequirements: {
    requirement: string;
    version: string | undefined | null;
    dueDate: Date | undefined | null;
    submittedOn: Date | undefined | null;
    status: RemarksStatus;
    documentID: number | undefined | null;
    acadTermFileId: number;
    isFileSubmission: boolean;
    requirementId: number;
  }[] = [];
  remarksColor = RemarksColor;
  remarksIcon = RemarksIcon;
  acadTerm!: number;
  ojtPhase!: number;
  currentOjtPhase!: number;
  isModalOpen = false;
  idNum = 0;
  requested = false;
  requestForm = this.fb.group({
    reasonMsg: ['', [Validators.required]],
  });
  submitted = false;
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;

  constructor(
    private manifestService: ManifestService,
    private loadingService: LoadingService,
    private supabaseService: SupabaseService,
    private accountService: AccountService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder
  ) {
    this.loadingService.showLoading();
    this.manifestService.getOptions('ojtPhase').subscribe((value) => {
      this.steps = value;
      this.accountService.getCurrentUsersWithPhase().subscribe((value) => {
        this.acadTerm = value['acadTermID'];
        this.ojtPhase = value['ojtPhaseID'];
        this.currentOjtPhase = value['ojtPhaseID'];
        this.requested = value['requestMigrate'];
        this.renderScreen();
      });
    });
    this.breadcrumbService.set('@documentStudent', 'Document Hub');
  }

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;

    // LISTENER
    this.supabaseService.getDocuHub().subscribe(() => {
      this.renderScreen();
    });
  }

  changePhase(phase: number) {
    this.ojtPhase = phase;
    this.renderScreen();
  }

  renderScreen() {
    this.loadingService.showLoading();
    this.documentService
      .getDocumentsStudentView(this.acadTerm, this.ojtPhase)
      .subscribe((value) => {
        this.documentRequirements = value;
        this.loadingService.hideLoading();
      });
  }

  toggleModal(idNum: number, isModalOpen?: boolean) {
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;
  }

  sendRequest() {
    this.submitted = true;
    if (this.requestForm.valid) {
      try {
        // this.loadingService.showLoading();
        this.documentService
          .requestMigrate(
            this.userID,
            this.requestForm.get('reasonMsg')?.value!
          )
          .subscribe(() => {
            this.toggleModal(1, false);
            this.toggleModal(2, true);
          });
      } catch (e) {
        console.error(e);
      }
    }
  }

  confirm() {
    this.toggleModal(2, false);
  }
}
