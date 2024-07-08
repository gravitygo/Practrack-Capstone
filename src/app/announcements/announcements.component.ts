import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AnnouncementService } from '../services/announcement.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ManifestService } from '../services/manifest.service';
import { LoadingService } from '../services/loading.service';
import { SupabaseService } from '../services/supabase.service';
import { SnackbarService } from '../services/snackbar.service';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss'],
})
export class AnnouncementsComponent {
  // User Logged
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;
  role: BehaviorSubject<string> = new BehaviorSubject('');
  submitted = false;
  studentProfile: any;

  // for filter
  options: any[] = [];
  batch: string = '';

  isModalOpen = false;
  announcementID = 0;
  idNum = 0;
  dropdownStates: { [key: number]: boolean } = {};

  addForm = this.fb.group({
    addSubject: ['', [Validators.required]],
    addAYTermIntake: ['', [Validators.required]],
    addMessage: ['', [Validators.required]],
  });

  editForm = this.fb.group({
    editSubject: ['', [Validators.required]],
    editAYTermIntake: ['', [Validators.required]],
    editMessage: ['', [Validators.required]],
  });

  deleteForm = this.fb.group({
    deleteSubject: { value: '', disabled: true },
    deleteAYTermIntake: { value: '', disabled: true },
    deleteMessage: { value: '', disabled: true },
  });

  allAnnouncements: any;

  constructor(
    private fb: FormBuilder,
    private announceServ: AnnouncementService,
    private router: Router,
    private manifestServ: ManifestService,
    private supabaseService: SupabaseService,
    private loadingService: LoadingService,
    private snack: SnackbarService
  ) {
    var hider = false,
      tokenAvail = false,
      optionsAvail = false;
    this.loadingService.showLoading();
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      tokenAvail = true;
      hider = tokenAvail && optionsAvail;
      if (hider) this.loadingService.hideLoading();
      this.role.next(token.claims['role'] as string);
    });
    this.manifestServ.getOptions('academicTerm').subscribe((keyValues) => {
      optionsAvail = true;
      hider = tokenAvail && optionsAvail;
      if (hider) this.loadingService.hideLoading();
      this.options = keyValues.reverse();
    });

    // Listeners
    this.supabaseService.getAnnouncements().subscribe(() => {
      this.role.subscribe((role) => {
        if (role == 'coordinator') {
          this.viewAnnouncements(1);
        } else if (role == 'student') {
          this.viewAnnouncements(2);
        }
      });
    });

    this.supabaseService.getAnnouncementsRead().subscribe(() => {
      this.role.subscribe((role) => {
        if (role == 'student') {
          this.viewAnnouncements(2);
        }
      });
    });
  }

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;
    this.role.subscribe((role) => {
      if (role == 'coordinator') {
        this.viewAnnouncements(1);
      } else if (role == 'student') {
        this.viewAnnouncements(2);
      }
    });
  }

  toggleDropdown(announcementID: number) {
    if (this.dropdownStates.hasOwnProperty(announcementID)) {
      this.dropdownStates[announcementID] =
        !this.dropdownStates[announcementID];
    } else {
      this.dropdownStates[announcementID] = true;
    }
  }

  isDropdownOpen(announcementID: number): boolean {
    return (
      this.dropdownStates.hasOwnProperty(announcementID) &&
      this.dropdownStates[announcementID]
    );
  }

  toggleModal(idNum: number, isModalOpen?: boolean, announcementID?: number) {
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;

    if (announcementID !== undefined) {
      this.announcementID = announcementID;
      this.viewAnnouncement(announcementID);
    }
  }

  addAnnouncement() {
    try {
      this.submitted = true;
      if (this.addForm.valid) {
        this.announceServ
          .addAnnouncement(
            {
              title: this.addForm.value['addSubject']!,
              announcement: this.addForm.value['addMessage']!,
              batch: this.addForm.value['addAYTermIntake']!,
              createdBy: this.userLogged.currentUser?.uid!,
            },
            this.userID
          )
          .subscribe(() => {
            this.router.navigate(['announcements/coor']);
            this.addForm.reset();
            this.toggleModal(1, false);
            this.submitted = false;
            this.viewAnnouncements(1);
            this.snack.openSnackBar(
              'Announcement successfully created.',
              '',
              'Success'
            );
          });
      }
    } catch (err) {
      console.error(err);
    }
  }

  viewAnnouncement(announcementID: number) {
    try {
      this.announceServ
        .viewAnnouncement(announcementID, this.userID, this.role.value)
        .subscribe((response) => {
          if (this.idNum == 2) {
            this.editForm.patchValue({
              editSubject: response.announcement[0].title,
              editMessage: response.announcement[0].announcement,
            });
            this.editForm
              .get('editAYTermIntake')!
              .setValue(response.announcement[0].batch);
          } else if (this.idNum == 3) {
            this.deleteForm
              .get('deleteSubject')
              ?.setValue(response.announcement[0].title);
            this.deleteForm
              .get('deleteAYTermIntake')
              ?.setValue(response.announcement[0].batch);
            this.deleteForm
              .get('deleteMessage')
              ?.setValue(response.announcement[0].announcement);
          }
        });
    } catch (err) {
      console.error(err);
    }
  }

  saveAnnouncement(announcementID: number) {
    try {
      if (this.editForm.valid) {
        this.announceServ
          .saveAnnouncement(
            announcementID,
            {
              title: this.editForm.get('editSubject')?.value!,
              announcement: this.editForm.get('editMessage')?.value!,
              batch: this.editForm.get('editAYTermIntake')?.value!,
              createdBy: this.userLogged.currentUser?.uid!,
            },
            this.userID
          )
          .subscribe(() => {
            this.editForm.reset();
            this.toggleModal(2, false);
            this.viewAnnouncements(1);
            this.snack.openSnackBar(
              'Announcement successfully edited.',
              '',
              'Success'
            );
          });
      }
    } catch (err) {
      console.error(err);
    }
  }

  deleteAnnouncement(announcementID: number) {
    try {
      this.announceServ
        .deleteAnnouncement(announcementID, this.userID)
        .subscribe(() => {
          this.deleteForm.reset();
          this.toggleModal(3, false);
          this.viewAnnouncements(1);
          this.snack.openSnackBar(
            'Announcement successfully deleted.',
            '',
            'Info'
          );
        });
    } catch (err) {
      console.error(err);
    }
  }

  viewAnnouncements(role: number) {
    try {
      if (role == 1) {
        // Coordinator
        if (this.batch !== '') {
          // Filtered
          this.announceServ
            .viewFilteredAnnouncements(this.batch)
            .subscribe((response) => {
              this.allAnnouncements = response;
            });
        } else {
          // Unfiltered
          this.announceServ.viewAnnouncements().subscribe((response) => {
            this.allAnnouncements = response;
          });
        }
      } else if (role == 2) {
        // Student
        this.announceServ
          .getStudentProfile(this.userID)
          .subscribe((response) => {
            this.studentProfile = response;
            var batch = response.profile[0].ayterm;
            this.announceServ
              .viewBatchAnnouncements(this.userID, batch)
              .subscribe((response) => {
                this.allAnnouncements = response.announcements;
              });
          });
      }
    } catch (err) {
      console.error(err);
    }
  }
}
