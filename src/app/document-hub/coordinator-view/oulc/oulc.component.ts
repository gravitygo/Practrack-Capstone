import { Component, ViewChild, TemplateRef, inject } from '@angular/core';
import { Tab } from '../../../model/tab.model';
import { Auth } from '@angular/fire/auth';

import {} from '@angular/fire/functions';
import { RemarksColor, RemarksIcon } from '../../../enum/deployment-color.enum';
import { DeploymentStage, RemarksStatus } from 'src/typings';
import { KeyValue } from '../../../model/manifest.model';
import { ManifestService } from '../../../services/manifest.service';
import { LoadingService } from '../../../services/loading.service';
import { DocumentService } from '../../../services/document.service';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-oulc',
  templateUrl: './oulc.component.html',
  styleUrls: ['./oulc.component.scss'],
})
export class OulcComponent {
  private auth: Auth = inject(Auth);

  remarksColor = RemarksColor;
  remarksIcon = RemarksIcon;

  isModalOpen = false;
  editHeaderName: string = '';
  oulcStatuses: KeyValue[] = [];
  currentDocument?: number = 0;

  feedback: string = 'a feedback';

  document: {
    documentName: string;
    fileStatus: number;
    statusValue: string;
    feedback: string;
    dateLastEdited?: string;
  } = {
    documentName: 'string',
    fileStatus: 1,
    statusValue: '1',
    feedback: 'string',
    dateLastEdited: 'string',
  };

  oulc: {
    documentID: number;
    documentName: string;
    student: string;
    dateReceived: string;
    remarks: RemarksStatus;
  }[] = [];

  oulcDocument = this.fb.group({
    status: ['', [Validators.required]],
    feedback: ['', [Validators.required]],
  });

  idNum = 0;

  constructor(
    private loadingService: LoadingService,
    private manifestService: ManifestService,
    private documentService: DocumentService,
    private fb: FormBuilder
  ) {
    this.loadingService.showLoading();

    this.manifestService.getOptions('status').subscribe((statuses) => {
      this.oulcStatuses = statuses;
    });
    this.documentService.getSubmittedDocuments().subscribe((documents) => {
      this.oulc = documents;
      this.loadingService.hideLoading();
    });
  }

  ngOnInit() {}

  setCurrentDocument(currentDocumentID: number) {
    this.loadingService.showLoading();
    this.documentService
      .getSubmittedDocument(currentDocumentID)
      .subscribe((values) => {
        this.currentDocument = currentDocumentID;
        this.document = values[0];
        this.oulcDocument = this.fb.group({
          status: { value: `${this.document.fileStatus}`, disabled: false },
          feedback: { value: `${this.document.feedback}`, disabled: false },
        });
        this.loadingService.hideLoading();
      });
  }

  updateOulcSubmission() {
    if (!this.oulcDocument.pristine) {
      this.loadingService.showLoading();
      this.documentService
        .patchOulcDocument(
          this.currentDocument!,
          this.oulcDocument.value!.feedback!,
          parseInt(this.oulcDocument.value!.status!)
        )
        .subscribe(() => {
          this.documentService
            .getSubmittedDocuments()
            .subscribe((documents) => {
              this.oulc = documents;
              this.loadingService.hideLoading();
              this.toggleModal(3);
            });
        });
    }
  }

  toggleModal(idNum: number, isModalOpen?: boolean, editName?: string) {
    if (editName) {
      this.editHeaderName = editName;
    }
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else {
      this.isModalOpen = !this.isModalOpen;
    }
    this.idNum = idNum;
  }
}
