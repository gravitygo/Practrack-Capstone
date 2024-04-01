import { Component, ViewChild, TemplateRef, inject } from '@angular/core';
import { Tab } from '../../../model/tab.model';
import { Auth } from '@angular/fire/auth';

import {} from '@angular/fire/functions';
import {
  DeploymentColor,
  RemarksColor,
  RemarksIcon,
} from '../../../enum/deployment-color.enum';
import { DeploymentStage, RemarksStatus } from 'src/typings';
import { KeyValue } from '../../../model/manifest.model';
import { ManifestService } from '../../../services/manifest.service';
import { LoadingService } from '../../../services/loading.service';
import { DocumentService } from '../../../services/document.service';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { BehaviorSubject } from 'rxjs';
import { Storage, ref, uploadBytesResumable } from '@angular/fire/storage';
@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss'],
})
export class RequirementsComponent {
  private auth: Auth = inject(Auth);
  private baseUrl = 'gs://practrack-411303.appspot.com';
  private storage: Storage = inject(Storage);

  activeTab: string = 'requirements'; // Default active tab
  deploymentColor = DeploymentColor;
  remarksColor = RemarksColor;
  remarksIcon = RemarksIcon;
  isModalOpen = false;
  editHeaderName: string = '';
  ojtPhases: KeyValue[] = [];
  oulcStatuses: KeyValue[] = [];
  academicTerm: KeyValue[] = [];
  currentRequirementID: number = 0;
  currentOjtPhase: number = 0;
  currentDocumentType?: number;
  currentAcadFileId?: number = 0;
  currentDocument?: number = 0;
  currentBatch: number = 0;
  requirements: any[] = [];
  feedback: string = 'a feedback';
  fileValue: Blob | null = null;
  inputHtml: HTMLInputElement | null = null;
  students: {
    id: string;
    startDate: string;
    endDate: string;
    fullName: string;
    acadTerm: string;
    ojtPhase: DeploymentStage;
  }[] = [];

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

  fileRequirement = this.fb.group({
    date: [''],
    phase: ['', [Validators.required]],
  });

  oulcDocument = this.fb.group({
    status: ['', [Validators.required]],
    feedback: ['', [Validators.required]],
  });

  addFileRequirement = this.fb.group({
    name: ['', Validators.required],
  });

  idNum = 0;
  constructor(
    private manifestService: ManifestService,
    private loadingService: LoadingService,
    private documentService: DocumentService,
    private accountService: AccountService,
    private fb: FormBuilder
  ) {
    this.loadingService.showLoading();
    this.manifestService.getOptions('ojtPhase').subscribe((phases) => {
      this.ojtPhases = phases;
    });

    this.manifestService.getOptions('academicTerm').subscribe((keyValues) => {
      this.academicTerm = keyValues;
      if (this.academicTerm[0]?.id) {
        this.documentService
          .getDocumentList(this.academicTerm[0]?.id)
          .subscribe((value) => {
            this.currentBatch = this.academicTerm[0]!.id!;
            this.requirements = value.documents;
          });
      }
      this.loadingService.hideLoading();
    });
  }

  setRequirementValues(
    currentOjtPhase: number,
    date: string,
    currentDocumentType: number,
    currentAcadFileId?: number
  ) {
    this.currentDocumentType = currentDocumentType;
    this.currentAcadFileId = currentAcadFileId;
    this.currentOjtPhase = currentOjtPhase;
    console.log(this.currentOjtPhase);
    this.fileRequirement = this.fb.group({
      date: { value: `${date}`, disabled: false },
      phase: { value: `${currentOjtPhase}`, disabled: false },
    });
  }

  setCurrentRequirementId(currentRequirementID: number) {
    this.currentRequirementID = currentRequirementID;
  }

  changeList(batchId: string) {
    this.currentBatch = Number(batchId);
    this.loadingService.showLoading();

    this.documentService
      .getDocumentList(this.currentBatch)
      .subscribe((value) => {
        this.requirements = value.documents;

        this.loadingService.hideLoading();
      });
  }

  updateCheckboxList(id: number, isChecked: any) {
    if (id === null) {
      this.toggleModal(5);
      isChecked.target.checked = false;
      return;
    }

    this.loadingService.showLoading();
    this.documentService
      .patchEnabled(id, isChecked.target.checked)
      .subscribe(() => {
        this.loadingService.hideLoading();
      });
  }

  addNewFileRequirement() {
    this.loadingService.showLoading();
    if (this.addFileRequirement.get('name')?.valid) {
      this.manifestService
        .addNewLookup(this.addFileRequirement.value.name!, 'documentType')
        .subscribe(() => {
          this.changeList(`${this.currentBatch}`);
        });
    }
    this.loadingService.hideLoading();
  }

  updateAcadFile() {
    if (!this.fileRequirement.pristine || this.fileValue) {
      this.loadingService.showLoading();
      if (
        this.currentAcadFileId === undefined ||
        this.currentAcadFileId === null
      ) {
        if (this.fileRequirement.value.phase !== 'null' && this.fileValue) {
          this.documentService
            .insertFile(
              this.currentBatch,
              Number(this.fileRequirement.value!.phase),
              this.currentDocumentType!,
              this.fileRequirement.value.date
            )
            .subscribe((val) => {
              this.changeList(`${this.currentBatch}`);
              this.uploadFile(val.id);
              this.loadingService.hideLoading();
              return;
            });
        } else {
          this.loadingService.hideLoading();
          return;
        }
      } else {
        this.documentService
          .patchDocument(
            this.currentAcadFileId,
            this.fileRequirement.value.date!,
            this.fileRequirement.value.phase!
          )
          .subscribe(() => {
            this.changeList(`${this.currentBatch}`);
            console.log(this.fileValue);
            if (this.fileValue) this.uploadFile(this.currentAcadFileId!);

            this.loadingService.hideLoading();
          });
      }
    }
    this.toggleModal(4);
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

  async uploadFile(val: number) {
    this.loadingService.showLoading();
    if (!this.fileValue) return;

    const storageRef = ref(this.storage, `${this.baseUrl}/initFile/${val}.pdf`);
    uploadBytesResumable(storageRef, this.fileValue);
    this.inputHtml!.value = '';
    this.loadingService.hideLoading();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fileValue = new Blob([reader.result as ArrayBuffer], {
          type: file.type,
        });
        this.inputHtml = input;
      };
      reader.readAsArrayBuffer(file);
    }
  }
}
