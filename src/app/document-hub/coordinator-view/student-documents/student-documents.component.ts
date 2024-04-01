import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RemarksColor, RemarksIcon } from 'src/app/enum/deployment-color.enum';
import { KeyValue } from 'src/app/model/manifest.model';
import { AccountService } from 'src/app/services/account.service';
import { DocumentService } from 'src/app/services/document.service';
import { ManifestService } from 'src/app/services/manifest.service';
import { RemarksStatus } from 'src/typings';
import { BreadcrumbService } from 'xng-breadcrumb';

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
  documentRequirements!: {
    requirement: string;
    version: string | undefined | null;
    submittedOn: Date | undefined | null;
    status: RemarksStatus;
    documentID: number | undefined | null;
  }[];
  constructor(
    private breadcrumbService: BreadcrumbService,
    private accountService: AccountService,
    private manifestService: ManifestService,
    private documentService: DocumentService,
    private route: ActivatedRoute
  ) {
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
          this.documentService
            .getSubmittedDocumentCoordinator(this.id!, value['ojtPhaseID'])
            .subscribe((value) => {
              this.documentRequirements = value;
              console.log(this.documentRequirements);
            });
        });
    });
  }
}
