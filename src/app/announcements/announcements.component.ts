import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AnnouncementService } from '../services/announcement.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ManifestService } from '../services/manifest.service';

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
    editSubject: [''],
    editAYTermIntake: [''],
    editMessage: [''],
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
    private manifestServ: ManifestService
  ) {
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });

    this.manifestServ.getOptions('academicTerm').subscribe((keyValues) => {
      this.options = keyValues.reverse();
    });
  }

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;
    this.role.subscribe((role) => {
      console.log(role);
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
    // Minor bug: If no existing announcements, create announcement modal does not open

    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;

    if (announcementID !== undefined) {
      this.announcementID = announcementID;
      console.log('TOGGLEMODAL ANNOUNCEMENTID:', this.announcementID);
      this.viewAnnouncement(announcementID);
    } else {
      console.log('Announcement ID is undefined');
    }

    console.log(this.isModalOpen);
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
            this.router.navigate(['announcements/' + this.userID + '/coor']);
            this.addForm.reset();
            this.toggleModal(1, false);
            this.viewAnnouncements(1);
          });
        console.log('Form submitted:', this.addForm.value);
      }
    } catch (err) {
      console.log('Error: ', err);
    }
  }

  viewAnnouncement(announcementID: number) {
    try {
      this.announceServ
        .viewAnnouncement(announcementID, this.userID)
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
      console.log('Error: ', err);
    }
  }

  saveAnnouncement(announcementID: number) {
    try {
      console.log('AnnouncementID: ' + announcementID);
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
        });
    } catch (err) {
      console.log('Error: ', err);
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
        });
    } catch (err) {
      console.log('Error: ', err);
    }
  }

  viewAnnouncements(role: number) {
    try {
      if (role == 1) {
        // Coordinator
        console.log('COOR');
        if (this.batch !== '') {
          console.log('FILTERED');
          // Filtered
          this.announceServ
            .viewFilteredAnnouncements(this.userID, this.batch)
            .subscribe((response) => {
              console.log(response);
              this.allAnnouncements = response;
            });
        } else {
          console.log('UNFILTERED');
          // Unfiltered
          this.announceServ
            .viewAnnouncements(this.userID)
            .subscribe((response) => {
              console.log(response);
              this.allAnnouncements = response;
            });
        }
      } else if (role == 2) {
        // Student
        console.log('STUDENT');
        this.announceServ
          .getStudentProfile(this.userID)
          .subscribe((response) => {
            this.studentProfile = response;
            var batch = response.profile[0].ayterm;
            this.announceServ
              .viewBatchAnnouncements(this.userID, batch)
              .subscribe((response) => {
                console.log(response);
                this.allAnnouncements = response.announcements;
              });
          });
      }
    } catch (err) {
      console.log('Error: ', err);
    }
  }
}
