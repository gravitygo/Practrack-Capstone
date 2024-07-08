import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { DocumentService } from 'src/app/services/document.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ManifestService } from 'src/app/services/manifest.service';
import { BreadcrumbService } from 'xng-breadcrumb';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-dtr',
  templateUrl: './dtr.component.html',
  styleUrls: ['./dtr.component.scss'],
})
export class DtrComponent {
  requirementID = this.route.snapshot.paramMap.get('id');
  timeForm!: FormGroup;
  pdfSrc!: string | ArrayBuffer;
  private auth: Auth = inject(Auth);
  atfl?: number;
  documents: any;
  currentVersion?: number;
  docuPhase?: number;
  matchPhase: boolean = false;

  private baseUrl = 'gs://practrack-411303.appspot.com';
  private storage: Storage = inject(Storage);

  constructor(
    private pdfViewer: NgxExtendedPdfViewerService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private manifestService: ManifestService,
    private accountService: AccountService
  ) {
    this.manifestService
      .getById(parseInt(this.requirementID as string))
      .subscribe((res) => {
        this.breadcrumbService.set('@dtrSubmit', `Submit - ${res.value}`);
        this.docuPhase = res.ojtPhase!;
      });
    this.getAllFiles();
  }
  ngOnInit() {
    this.timeForm = this.formBuilder.group(
      {
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        hoursRendered: ['', Validators.required],
      },
      { validator: this.dateValidator }
    );
    this.addTimeEntry();
  }

  dateValidator(formGroup: FormGroup) {
    const startDate = formGroup.get('startDate')?.value;
    const endDate = formGroup.get('endDate')?.value;

    if (startDate > endDate) {
      return { endDateBeforeStartDate: true };
    } else {
      return null;
    }
  }

  get timeEntries() {
    return this.timeForm.get('timeEntries') as FormArray;
  }

  getAllFiles() {
    this.documentService
      .getAllSubmittedDocumentRequirement(
        Number.parseInt(this.requirementID ?? ''),
        this.auth.currentUser?.uid ?? ''
      )
      .subscribe((value) => {
        this.documents = value.rows[0];
        this.accountService
          .getCurrentUsersWithPhase(this.auth.currentUser?.uid)
          .subscribe((res) => {
            if (this.docuPhase == res.ojtPhaseID) this.matchPhase = true;
          });
        this.atfl = this.documents.AcadTermFileListID;
        this.currentVersion = this.documents.nextVersion;
        this.retrieveFile();
      });
  }

  onFileSelected(event: Event) {
    this.loadingService.showLoading();
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.pdfSrc = reader.result!;
      };
      reader.readAsDataURL(file);

      this.loadingService.hideLoading();
    }
  }
  addTimeEntry() {
    this.timeEntries.push(
      this.formBuilder.group({
        timeIn: ['', Validators.required],
        timeOut: ['', Validators.required],
        dateI: ['', Validators.required],
      })
    );
  }

  async retrieveFile() {
    this.loadingService.showLoading();
    if (!this.documents.documents.length) {
      const storageRef = ref(
        this.storage,
        `${this.baseUrl}/initFile/${this.atfl}.pdf`
      );
      getDownloadURL(storageRef).then((val) => {
        this.pdfSrc = val;
        this.currentVersion = undefined;
        this.loadingService.hideLoading();
      });
    } else {
      const storageRef = ref(
        this.storage,
        `${this.baseUrl}/${this.auth.currentUser?.uid}/${this.requirementID}-${
          this.currentVersion! - 1
        }.pdf`
      );
      getDownloadURL(storageRef).then((val) => {
        this.pdfSrc = val;
        this.loadingService.hideLoading();
      });
    }
  }

  async retrieveSubmittedFile(version: number) {
    this.loadingService.showLoading();
    const storageRef = ref(
      this.storage,
      `${this.baseUrl}/${this.auth.currentUser?.uid}/${this.requirementID}-${version}.pdf`
    );
    getDownloadURL(storageRef).then((val) => {
      this.pdfSrc = val;
      // this.feedback = this.documents.documents[version].feedback;

      this.currentVersion = version;
      this.loadingService.hideLoading();
    });
  }
  removeTimeEntry(index: number) {
    this.timeEntries.removeAt(index);
  }

  async uploadFile() {
    this.timeForm.markAllAsTouched();

    if (this.timeForm.valid) {
      this.loadingService.showLoading();

      const pdfBlob: Blob = await this.pdfViewer.getCurrentDocumentAsBlob();
      if (!pdfBlob.size) return;

      this.documentService
        .submitDtr(
          this.timeForm.get('startDate')?.value,
          this.timeForm.get('endDate')?.value,
          this.timeForm.get('hoursRendered')?.value,
          parseInt(this.requirementID ?? '0'),
          this.atfl ?? 0,
          parseInt(this.documents?.nextVersion ?? 0)
        )
        .subscribe(() => {
          const storageRef = ref(
            this.storage,
            `${this.baseUrl}/${this.auth.currentUser?.uid}/${
              this.requirementID
            }-${this.documents?.nextVersion ?? 0}.pdf`
          );
          uploadBytesResumable(storageRef, pdfBlob).then(() => {
            this.getAllFiles();
            this.loadingService.hideLoading();
          });
        });
    } else {
      console.log('Invalid');
    }
  }
}
