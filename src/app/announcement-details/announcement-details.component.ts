import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnouncementDetailsService } from '../services/announcement-details.service';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-announcement-details',
  templateUrl: './announcement-details.component.html',
  styleUrls: ['./announcement-details.component.scss'],
})
export class AnnouncementDetailsComponent {
  // User Logged
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;
  role: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private announceServ: AnnouncementDetailsService,
    private fb: FormBuilder
  ) {
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });
  }

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;
    this.role.subscribe((role) => {
      console.log(role);
      if (role == 'coordinator') {
        this.viewAnnouncement(1);
      } else if (role == 'student') {
        this.viewAnnouncement(2);
      }
    });
  }

  submitted = false;

  isModalOpen = false;
  idNum = 0;
  announcement: any;
  announcementID = Number(this.route.snapshot.paramMap.get('id'));

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

  toggleModal(idNum: number, isModalOpen?: boolean) {
    // Minor bug: If no existing announcements, create announcement modal does not open

    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;

    console.log(this.isModalOpen);

    if (this.idNum == 2) {
      this.editForm.patchValue({
        editSubject: this.announcement.title,
        editMessage: this.announcement.announcement,
      });
      this.editForm.get('editAYTermIntake')!.setValue(this.announcement.batch);
    } else if (this.idNum == 3) {
      this.deleteForm.get('deleteSubject')?.setValue(this.announcement.title);
      this.deleteForm
        .get('deleteAYTermIntake')
        ?.setValue(this.announcement.batch);
      this.deleteForm
        .get('deleteMessage')
        ?.setValue(this.announcement.announcement);
    }
  }

  viewAnnouncement(role: number) {
    try {
      console.log('Announcement ID:', this.announcementID);
      if (role == 1) {
        // Coordinator
        this.announceServ
          .viewAnnouncement(this.announcementID)
          .subscribe((response) => {
            console.log(response);
            this.announcement = response.announcement[0];
          });
      } else if (role == 2) {
        // Student
        this.announceServ
          .viewAnnouncementStudent(this.announcementID, this.userID)
          .subscribe((response) => {
            this.announcement = response.announcement[0];
          });
      }
    } catch (err) {
      console.log('Error: ', err);
    }
  }

  saveAnnouncement() {
    try {
      this.announceServ
        .saveAnnouncement(this.announcementID, {
          title: this.editForm.get('editSubject')?.value!,
          announcement: this.editForm.get('editMessage')?.value!,
          batch: this.editForm.get('editAYTermIntake')?.value!,
          createdBy: this.userLogged.currentUser?.uid!,
        })
        .subscribe(() => {
          this.editForm.reset();
          this.toggleModal(2, false);
          this.viewAnnouncement(1);
        });
    } catch (err) {
      console.log('Error: ', err);
    }
  }

  deleteAnnouncement() {
    try {
      this.announceServ
        .deleteAnnouncement(
          this.announcementID,
          this.userLogged.currentUser!.uid!
        )
        .subscribe(() => {
          this.deleteForm.reset();
          this.toggleModal(3, false);
          this.router.navigate(['announcements']);
        });
    } catch (err) {
      console.log('Error: ', err);
    }
  }
}
