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
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss'],
})
export class SubmissionComponent {
  id = this.route.snapshot.paramMap.get('id');
  atfl = this.route.snapshot.paramMap.get('atfl');
  src!: string;
  pdfSrc!: string | ArrayBuffer;
  docuName!: string;
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
        this.docuName = res.value!;
        this.retrieveFile().then(() => {
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
      `${this.baseUrl}/initFile/${this.atfl}.pdf`
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
      .submitDocuments(`${this.id}.pdf`, parseInt(this.atfl!))
      .subscribe((value) => {
        const storageRef = ref(
          this.storage,
          `${this.baseUrl}/${this.auth.currentUser?.uid}/${value}.pdf`
        );

        uploadBytesResumable(storageRef, pdfBlob).then(() => {
          this.router.navigate([`/documentHub/resubmit/${value}`]);
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
