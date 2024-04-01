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

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
})
export class DocumentViewerComponent {
  documentId = this.route.snapshot.paramMap.get('documentID');
  id = this.route.parent?.snapshot.paramMap.get('id');
  documentInfo!: {
    documentName: string;
    fileStatus: number;
    statusValue: string;
    feedback?: string | null;
    dateLastEdited?: string;
  };
  blob!: Blob;
  statuses: KeyValue[] = [];
  feedback!: FormGroup;

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
    private fb: FormBuilder
  ) {
    this.loadingService.showLoading();
    this.manifestService.getOptions('status').subscribe((statuses) => {
      this.statuses = statuses;
    });
    this.documentService
      .getSubmittedDocument(parseInt(this.documentId!))
      .subscribe((value) => {
        this.retrieveFile().then(() => {
          this.documentInfo = value[0];
          this.feedback = this.fb.group({
            status: [this.documentInfo.fileStatus, [Validators.required]],
            feedback: [this.documentInfo.feedback],
          });
          this.breadcrumbService.set(
            '@viewDocumentForCoordinator',
            `Document Viewer: ${value[0].documentName}`
          );
          this.loadingService.hideLoading();
        });
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
        parseInt(this.documentId!)
      )
      .subscribe(() => {
        const storageRef = ref(
          this.storage,
          `${this.baseUrl}/${this.id}/${this.documentId}.pdf`
        );
        uploadBytesResumable(storageRef, pdfBlob).then(() => {
          this.router.navigate([`/documentHub/coordinator/${this.id}`]);
          this.loadingService.hideLoading();
        });
      });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.pdfSrc = reader.result!;
      };
      reader.readAsDataURL(file);
    }
  }

  async retrieveFile() {
    const storageRef = ref(
      this.storage,
      `${this.baseUrl}/${this.id}/${this.documentId}.pdf`
    );
    getDownloadURL(storageRef).then((val) => {
      this.pdfSrc = val;
    });
  }
}
