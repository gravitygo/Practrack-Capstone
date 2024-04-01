import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RemarksColor, RemarksIcon } from 'src/app/enum/deployment-color.enum';
import { KeyValue } from 'src/app/model/manifest.model';
import { AccountService } from 'src/app/services/account.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ManifestService } from 'src/app/services/manifest.service';
import { RemarksStatus } from 'src/typings';
import { BreadcrumbService } from 'xng-breadcrumb';

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
    requirementId: number;
  }[] = [];
  remarksColor = RemarksColor;
  remarksIcon = RemarksIcon;
  acadTerm!: number;
  ojtPhase!: number;

  constructor(
    private manifestService: ManifestService,
    private loadingService: LoadingService,
    private accountService: AccountService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService
  ) {
    this.loadingService.showLoading();
    this.manifestService.getOptions('ojtPhase').subscribe((value) => {
      this.steps = value;
      this.accountService.getCurrentUsersWithPhase().subscribe((value) => {
        this.acadTerm = value['acadTermID'];
        this.ojtPhase = value['ojtPhaseID'];
        this.renderScreen();
      });
    });
    this.breadcrumbService.set('@documentStudent', 'Document Hub');
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
}
