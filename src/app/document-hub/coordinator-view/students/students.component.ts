import { Component, inject, ViewChild} from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, Validators } from '@angular/forms';

import {} from '@angular/fire/functions';

import { DeploymentStage } from 'src/typings';
import { LoadingService } from '../../../services/loading.service';
import { AccountService } from '../../../services/account.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ManifestService } from '../../../services/manifest.service';
import { KeyValue } from '../../../model/manifest.model';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
})
export class StudentsComponent {
  private auth: Auth = inject(Auth);
  userLogged = this.auth;

// Paginator ViewChild
@ViewChild(MatPaginator) paginator!: MatPaginator;

  students: any[] = [];
  uncheckedDocs: any[] = [];
  idNum = 0;
  isModalOpen = false;
  // PHASE FILTER
  chosenPhase: number = 0;
  phases: KeyValue[] = [];
  // SEARCH FILTER FUNCTION
  searchText: any;
  filteredStudents: any[] = [];

  activeBatches: any[] = [];

  // Paginator Variables
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  getVisibleIndices(): number[] {
    const startIndex = this.paginator?.pageIndex * this.paginator?.pageSize;
    const endIndex = startIndex + this.paginator?.pageSize;
    return Array.from(
      { length: this.filteredStudents.length },
      (_, index) => index
    ).slice(startIndex, endIndex);
  }

  // SEARCH Filter function
  filterData(): void {
    const searchKeys = [
      'fullName',
      'acadTerm',
      'degreeCode',
      'formattedStartDate',
      'formattedEndDate',
      'ojtPhase',
    ];
    if (!this.searchText) {
      this.filteredStudents = this.students.slice();
    } else {
      this.filteredStudents = this.students.filter((student: any) =>
        searchKeys.some(
          (key) =>
            student[key]
              ?.toString()
              .toLowerCase()
              .includes(this.searchText.toLowerCase())
        )
      );
    }
  }

  constructor(
    private loadingService: LoadingService,
    private accountService: AccountService,
    private supabaseService: SupabaseService,
    private manifestService: ManifestService,
    private fb: FormBuilder
  ) {
    this.loadingService.showLoading();
    this.manifestService.getOptions('ojtPhase').subscribe((keyValues) => {
      this.phases = keyValues;
    });
    // Get active batches
    this.manifestService.getOptions('academicTerm').subscribe((keyValues) => {
      for (let i = 0; i < keyValues.length; i++) {
        this.activeBatches.push(keyValues[i].value!);
      }
      this.getAll();
    });

    // LISTENER
    this.supabaseService.getDocuHub().subscribe(() => {
      this.getAll();
    });
  }

  ngOnInit() {}

  getAll() {
    this.accountService.getUsersWithPhase().subscribe((response) => {
      this.students = response.users;
      this.uncheckedDocs = response.unchecked;

      // Filter students in active batches only
      this.students = this.students.filter((student) =>
        this.activeBatches.includes(student.acadTerm)
      );

      this.students.forEach((student) => {
        student['unchecked'] = 0;
        this.uncheckedDocs.forEach((doc) => {
          if (student.createdBy == doc.createdBy) {
            student['unchecked']++;
          }
        });
      });

      // Sort students by unchecked
      this.students.sort((a, b) => b.unchecked - a.unchecked);

      this.filteredStudents = this.students.slice(); // Initialize filteredStudents DATA
      this.loadingService.hideLoading();
    });
  }

  changeList(phaseId: string) {
    this.chosenPhase = Number(phaseId);
    this.loadingService.showLoading();

    if (this.chosenPhase === 0) {
      this.getAll();
    } else {
      this.accountService
        .getUsersWithSpecificPhase(this.chosenPhase)
        .subscribe((response) => {
          this.students = response.users;
          this.uncheckedDocs = response.unchecked;

          // Filter students in active batches only
          this.students = this.students.filter((student) =>
            this.activeBatches.includes(student.acadTerm)
          );

          this.students.forEach((student) => {
            student['unchecked'] = 0;
            this.uncheckedDocs.forEach((doc) => {
              if (student.createdBy == doc.createdBy) {
                student['unchecked']++;
              }
            });
          });

          // Sort students by unchecked
          this.students.sort((a, b) => b.unchecked - a.unchecked);

          this.filteredStudents = this.students.slice(); // Initialize filteredStudents DATA
          this.loadingService.hideLoading();
        });
    }
  }
}
