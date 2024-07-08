import { Component, ViewChild, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, Validators } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { LoadingService } from '../services/loading.service';
import { SnackbarService } from '../services/snackbar.service';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-batch',
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.scss'],
})
export class BatchComponent {
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;

  idNum = 0;
  isModalOpen = false;
  batchID = 0;
  batch: any;
  batches: any;
  addBatch: any;
  computedBatch: any;
  submitted = false;

  addBatchForm = this.fb.group({
    batch: { value: '', disabled: true },
    minHours: ['', [Validators.required]],
  });
  editBatchForm = this.fb.group({
    batch: { value: '', disabled: true },
    minHours: ['', [Validators.required]],
  });
  disableBatchForm = this.fb.group({
    batch: { value: '', disabled: true },
    minHours: { value: '', disabled: true },
  });
  enableBatchForm = this.fb.group({
    batch: { value: '', disabled: true },
    minHours: { value: '', disabled: true },
  });

  // Paginator ViewChild
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Paginator Variables
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // SEARCH FILTER FUNCTION
  searchText: any;
  filteredBatches: any[] = [];

  constructor(
    private fb: FormBuilder,
    private batchServ: BatchService,
    private loadingService: LoadingService,
    private snack: SnackbarService
  ) {}

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;
    this.loadingService.showLoading();
    try {
      this.viewBatches();
      this.loadingService.hideLoading();
    } catch (err) {
      console.error(err);
    }
  }

  getVisibleIndices(): number[] {
    const startIndex = this.paginator?.pageIndex * this.paginator?.pageSize;
    const endIndex = startIndex + this.paginator?.pageSize;
    return Array.from(
      { length: this.filteredBatches.length },
      (_, index) => index
    ).slice(startIndex, endIndex);
  }

  // SEARCH Filter function
  filterData(): void {
    const searchKeys = ['batch', 'hours', 'students'];
    if (!this.searchText) {
      this.filteredBatches = this.batches.slice();
    } else {
      this.filteredBatches = this.batches.filter((batch: any) =>
        searchKeys.some(
          (key) =>
            batch[key]
              ?.toString()
              .toLowerCase()
              .includes(this.searchText.toLowerCase())
        )
      );
    }
  }

  viewBatches() {
    try {
      this.batchServ.getBatches().subscribe((res) => {
        this.batches = res.batches;
        this.filteredBatches = this.batches.slice();
        this.filterData();
      });
    } catch (err) {
      console.error(err);
    }
  }

  toggleModal(idNum: number, isModalOpen?: boolean, batchID?: number) {
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;

    // Edit Batch
    if (idNum == 2 && batchID) {
      this.batchID = batchID;
      this.batchServ.getBatch(batchID).subscribe((res) => {
        this.batch = res.batch[0];
        this.editBatchForm.setValue({
          batch: this.batch.batch,
          minHours: this.batch.hours,
        });
      });
    }
    // Add Batch
    if (idNum == 1) {
      this.batchServ.computeBatch().subscribe((res) => {
        this.addBatch = res.newBatch[0].value;
        var AY = Number(this.addBatch.slice(5, 7));
        var term = Number(this.addBatch.slice(9));
        if (term == 3) {
          // add to AY
          var startAY = AY;
          AY++;
          var endAY = AY;
          this.computedBatch = 'AY' + startAY + '-' + endAY + ' ' + 'T1';
        } else {
          term++;
          this.computedBatch = 'AY' + (AY - 1) + '-' + AY + ' ' + 'T' + term;
        }
        this.addBatchForm.get('batch')!.setValue(this.computedBatch);
      });
    }
    // Disable Batch
    else if (idNum == 3 && batchID) {
      this.disableBatchForm.reset();
      this.batchID = batchID;
      this.batchServ.getBatch(batchID).subscribe((res) => {
        this.batch = res.batch[0];
        this.disableBatchForm.setValue({
          batch: this.batch.batch,
          minHours: this.batch.hours,
        });
      });
    }
    // Enable Batch
    else if (idNum == 4 && batchID) {
      this.enableBatchForm.reset();
      this.batchID = batchID;
      this.batchServ.getBatch(batchID).subscribe((res) => {
        this.batch = res.batch[0];
        this.enableBatchForm.setValue({
          batch: this.batch.batch,
          minHours: this.batch.hours,
        });
      });
    }
  }

  saveBatch(batchID: number) {
    try {
      this.loadingService.showLoading();
      this.batchServ
        .saveBatch(batchID, {
          batchID: batchID,
          minHours: Number(this.editBatchForm.get('minHours')?.value!),
          lastEditedBy: this.userID,
        })
        .subscribe(() => {
          this.loadingService.hideLoading();
          this.toggleModal(2, false);
          this.viewBatches();
          this.snack.openSnackBar(
            'Batch has been updated successfully.',
            '',
            'Success'
          );
        });
    } catch (err) {
      console.error(err);
    }
  }

  submitBatch() {
    this.submitted = true;
    if (!this.addBatchForm.get('minHours')!.invalid) {
      try {
        this.loadingService.showLoading();
        this.batchServ
          .insertBatch({
            batchAY: this.computedBatch,
            minHours: Number(this.addBatchForm.get('minHours')?.value!),
            lastEditedBy: this.userID,
          })
          .subscribe(() => {
            this.loadingService.hideLoading();
            this.toggleModal(1, false);
            this.viewBatches();
            this.snack.openSnackBar(
              'Batch  ' +
                this.computedBatch +
                ' has been created successfully.',
              '',
              'Success'
            );
          });
      } catch (err) {
        console.error(err);
      }
    }
  }

  disableBatch(batch: number) {
    this.batchServ.disableBatch(batch).subscribe(() => {
      this.toggleModal(3, false);
      this.viewBatches();
      this.snack.openSnackBar(
        'Batch  ' + this.batch.batch + ' has been disabled successfully.',
        '',
        'Info'
      );
    });
  }

  enableBatch(batch: number) {
    this.batchServ.enableBatch(batch).subscribe(() => {
      this.toggleModal(4, false);
      this.viewBatches();
      this.snack.openSnackBar(
        'Batch  ' + this.batch.batch + ' has been enabled successfully.',
        '',
        'Success'
      );
    });
  }
}
