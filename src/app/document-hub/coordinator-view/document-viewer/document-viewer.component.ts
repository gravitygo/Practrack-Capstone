import { Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { BreadcrumbService } from 'xng-breadcrumb';
import { AccountService } from 'src/app/services/account.service';
import { ManifestService } from 'src/app/services/manifest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from 'src/app/services/document.service';
import { KeyValue } from 'src/app/model/manifest.model';
import { LoadingService } from 'src/app/services/loading.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
})
export class DocumentViewerComponent {
  atfl = this.route.snapshot.paramMap.get('acadTermId');
  documentName = this.route.snapshot.paramMap.get('name');
  documentType!: boolean;
  id = this.route.parent?.snapshot.paramMap.get('id'); //userId
  documentId!: number;
  documents: any;
  blob!: Blob;
  statuses: KeyValue[] = [];
  feedback!: FormGroup;
  currentVersion?: number;
  isApproved: boolean = false;
  currentDocument: any;

  private baseUrl = 'gs://practrack-411303.appspot.com';
  private storage: Storage = inject(Storage);
  private auth: Auth = inject(Auth);
  pdfSrc!: string | ArrayBuffer;
  constructor(
    private pdfViewer: NgxExtendedPdfViewerService,
    private breadcrumbService: BreadcrumbService,
    private accountService: AccountService,
    private manifestService: ManifestService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private fb: FormBuilder,
    private snack: SnackbarService
  ) {
    this.loadingService.showLoading();
    this.manifestService.getOptions('status').subscribe((statuses) => {
      statuses.pop();
      this.statuses = statuses;
      this.feedback = this.fb.group({
        status: [null, [Validators.required]],
        feedback: [null],
      });
      this.getFiles();
      this.breadcrumbService.set(
        '@viewDocumentForCoordinator',
        `Document Viewer: ${this.documentName}` //add name
      );
    });
  }

  async uploadFile() {
    this.loadingService.showLoading();
    const pdfBlob: Blob = await this.pdfViewer.getCurrentDocumentAsBlob();
    if (!pdfBlob.size) return;

    this.documentService
      .sendFeedback(
        this.feedback.value.feedback,
        this.feedback.value.status,
        parseInt(this.currentDocument.documentID!)
      )
      .subscribe(() => {
        const storageRef = ref(
          this.storage,
          `${this.baseUrl}/${this.id}/${this.documentId}-${this.currentVersion}.pdf`
        );
        uploadBytesResumable(storageRef, pdfBlob).then(() => {
          this.getFiles();
          this.loadingService.hideLoading();
          this.snack.openSnackBar(
            'File status is now updated successfully.',
            '',
            'Success'
          );
        });
      });
  }

  getFiles() {
    this.documentService
      .getAllSubmittedDocument(Number.parseInt(this.atfl ?? ''), this.id ?? '')
      .subscribe((value) => {
        this.documents = value.rows[0];
        this.documentId = this.documents.Requirement;
        this.documentType = this.documents.isFileSubmission;
        this.retrieveSubmittedFile(
          this.currentVersion ?? this.documents.nextVersion - 1
        ).then(() => {
          (this.documents?.documents).forEach(
            (element: { fileStatus: number }) => {
              this.isApproved ||= element.fileStatus == 15;
            }
          );
          this.loadingService.hideLoading();
        });
      });
  }
  async retrieveSubmittedFile(version: number) {
    this.loadingService.showLoading();
    this.currentDocument = this.documents.documents[version];
    const storageRef = ref(
      this.storage,
      `${this.baseUrl}/${this.id}/${this.documentId}-${version}.pdf`
    );
    getDownloadURL(storageRef).then((val) => {
      this.pdfSrc = val;
      this.feedback = this.fb.group({
        status: [
          this.documents.documents[version].fileStatus,
          [Validators.required],
        ],
        feedback: [this.documents.documents[version].feedback],
      });

      this.currentVersion = version;
      this.loadingService.hideLoading();
    });
  }
}
