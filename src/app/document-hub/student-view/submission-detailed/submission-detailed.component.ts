import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { BreadcrumbService } from 'xng-breadcrumb';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { DocumentService } from 'src/app/services/document.service';
import { ManifestService } from 'src/app/services/manifest.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
@Component({
  selector: 'app-submission-detailed',
  templateUrl: './submission-detailed.component.html',
  styleUrls: ['./submission-detailed.component.scss'],
})
export class SubmissionDetailedComponent {
  id = this.route.snapshot.paramMap.get('id');
  src!: string;
  pdfSrc!: string | ArrayBuffer;
  documentInfo: any;
  docuName!: string;
  private baseUrl = 'gs://practrack-411303.appspot.com';
  private storage: Storage = inject(Storage);
  private auth: Auth = inject(Auth);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pdfViewer: NgxExtendedPdfViewerService,
    private breadcrumbService: BreadcrumbService,
    private documentService: DocumentService,
    private loadingService: LoadingService,
    private manifestService: ManifestService,
    private snack: SnackbarService
  ) {
    this.loadingService.showLoading();
    this.documentService.getDocument(parseInt(this.id!)).subscribe((res) => {
      this.documentInfo = res[0];
      this.retrieveFile().then(() => {
        this.breadcrumbService.set(
          '@documentHubResubmit',
          `Resubmit - ${this.documentInfo.value}`
        );
        this.docuName = this.documentInfo.value!;

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
      `${this.baseUrl}/${this.auth.currentUser?.uid}/${this.id}.pdf`
    );
    getDownloadURL(storageRef).then((val) => {
      this.pdfSrc = val;
    });
  }

  async uploadFile() {
    this.loadingService.showLoading();
    const pdfBlob: Blob = await this.pdfViewer.getCurrentDocumentAsBlob();
    if (!pdfBlob.size) return;

    this.documentService
      .patchSubmittedDocument(parseInt(this.id!))
      .subscribe(() => {
        const storageRef = ref(
          this.storage,
          `${this.baseUrl}/${this.auth.currentUser?.uid}/${parseInt(
            this.id!
          )}.pdf`
        );

        uploadBytesResumable(storageRef, pdfBlob).then(() => {
          this.router.navigate([`/documentHub/resubmit/${parseInt(this.id!)}`]);
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
