import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { ManifestService } from 'src/app/services/manifest.service';
import { BreadcrumbService } from 'xng-breadcrumb';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { DocumentService } from 'src/app/services/document.service';
import { AccountService } from 'src/app/services/account.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-submission-v2',
  templateUrl: './submission-v2.component.html',
  styleUrls: ['./submission-v2.component.scss'],
})
export class SubmissionV2Component {
  id = this.route.snapshot.paramMap.get('id');
  atfl = this.route.snapshot.paramMap.get('atfl');
  src!: string;
  pdfSrc!: string | ArrayBuffer;
  docuName!: string;
  documents: any;
  feedback: string = '';
  currentVersion?: number;
  isApproved: boolean = false;
  docuPhase?: number;
  matchPhase: boolean = false;

  private baseUrl = 'gs://practrack-411303.appspot.com';
  private storage: Storage = inject(Storage);
  private auth: Auth = inject(Auth);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private manifestService: ManifestService,
    private pdfViewer: NgxExtendedPdfViewerService,
    private loadingService: LoadingService,
    private documentService: DocumentService,
    private accountService: AccountService,
    private snack: SnackbarService
  ) {
    this.loadingService.showLoading();
    this.manifestService
      .getById(parseInt(this.id as string))
      .subscribe((res) => {
        this.breadcrumbService.set(
          '@documentHubSubmit',
          `Submit - ${res.value}`
        );
        this.docuPhase = res.ojtPhase!;
        this.docuName = res.value!;
        this.getFiles();
      });
  }

  getFiles() {
    this.documentService
      .getAllSubmittedDocument(
        Number.parseInt(this.atfl ?? ''),
        this.auth.currentUser?.uid ?? ''
      )
      .subscribe((value) => {
        this.documents = value.rows[0];
        this.accountService
          .getCurrentUsersWithPhase(this.auth.currentUser?.uid)
          .subscribe((res) => {
            if (this.docuPhase == res.ojtPhaseID) this.matchPhase = true;
          });
        if (this.documents?.nextVersion) {
          this.retrieveSubmittedFile(this.documents.nextVersion - 1).then(
            () => {
              this.currentVersion = this.documents?.nextVersion;
              (this.documents?.documents).forEach(
                (element: { fileStatus: number }) => {
                  this.isApproved ||= element.fileStatus == 15;
                }
              );
              this.loadingService.hideLoading();
            }
          );
        } else {
          this.retrieveFile().then(() => {
            this.loadingService.hideLoading();
          });
        }
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

  async retrieveFile() {
    this.loadingService.showLoading();
    const storageRef = ref(
      this.storage,
      `${this.baseUrl}/initFile/${this.atfl}.pdf`
    );
    getDownloadURL(storageRef).then((val) => {
      this.pdfSrc = val;
      this.currentVersion = undefined;
      this.loadingService.hideLoading();
    });
  }

  async retrieveSubmittedFile(version: number) {
    this.loadingService.showLoading();
    const storageRef = ref(
      this.storage,
      `${this.baseUrl}/${this.auth.currentUser?.uid}/${this.id}-${version}.pdf`
    );
    getDownloadURL(storageRef).then((val) => {
      this.pdfSrc = val;
      this.feedback = this.documents.documents[version].feedback;

      this.currentVersion = version;
      this.loadingService.hideLoading();
    });
  }

  async uploadFile() {
    this.loadingService.showLoading();
    const pdfBlob: Blob = await this.pdfViewer.getCurrentDocumentAsBlob();
    if (!pdfBlob.size) return;

    this.documentService
      .submitDocumentsv2(
        `${this.id}.pdf`,
        parseInt(this.atfl!),
        parseInt(this.documents?.nextVersion ?? 0)
      )
      .subscribe((value) => {
        const storageRef = ref(
          this.storage,
          `${this.baseUrl}/${this.auth.currentUser?.uid}/${this.id}-${
            this.documents?.nextVersion ?? 0
          }.pdf`
        );

        uploadBytesResumable(storageRef, pdfBlob).then(() => {
          this.getFiles();
          this.documents.nextVersion = (this.documents?.nextVersion ?? 0) + 1;
          this.loadingService.hideLoading();
        });
        this.snack.openSnackBar(
          'Requirement has been submitted successfully.',
          '',
          'Success'
        );
      });
  }
}
