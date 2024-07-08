import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnouncementDetailsService } from '../services/announcement-details.service';
import { ManifestService } from 'src/app/services/manifest.service';
import { SupabaseService } from '../services/supabase.service';
import { LoadingService } from '../services/loading.service';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-announcement-details',
  templateUrl: './announcement-details.component.html',
  styleUrls: ['./announcement-details.component.scss'],
})
export class AnnouncementDetailsComponent {
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;
  role: BehaviorSubject<string> = new BehaviorSubject('');
  options: any[] = [];
  isDropdownOpen: boolean = false;
  isModalOpen: boolean = false;
  idNum: number = 0;
  announcement: any;
  announcementID = Number(this.route.snapshot.paramMap.get('id'));

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private announceServ: AnnouncementDetailsService,
    private manifestServ: ManifestService,
    private supabaseService: SupabaseService,
    private loadingService: LoadingService,
    private fb: FormBuilder
  ) {
    this.loadingService.showLoading();
    this.userID = this.userLogged.currentUser?.uid!;

    this.manifestServ.getOptions('academicTerm').subscribe((keyValues) => {
      this.options = keyValues.reverse();
      this.loadingService.hideLoading();
    });

    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
      this.viewAnnouncement();
    });

    // Listeners
    this.supabaseService.getAnnouncements().subscribe(() => {
      this.viewAnnouncement();
    });

    this.supabaseService.getAnnouncementsRead().subscribe(() => {
      this.viewAnnouncement();
    });
  }

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

  toggleDropdown(isDropdownOpen?: boolean) {
    if (isDropdownOpen != null) this.isDropdownOpen = isDropdownOpen;
    else this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleModal(idNum: number, isModalOpen?: boolean) {
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;
    this.toggleDropdown(false);

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

  viewAnnouncement() {
    try {
      this.announceServ
        .viewAnnouncement(this.announcementID, this.userID, this.role.value)
        .subscribe((response) => {
          this.announcement = response.announcement[0];
        });
    } catch (err) {
      console.error(err);
    }
  }

  setRead() {
    this.announceServ
      .setRead(this.announcementID, this.auth.currentUser!.uid)
      .subscribe();
  }

  saveAnnouncement() {
    try {
      if (this.editForm.valid) {
        this.announceServ
          .saveAnnouncement(
            this.announcementID,
            {
              title: this.editForm.get('editSubject')?.value!,
              announcement: this.editForm.get('editMessage')?.value!,
              batch: this.editForm.get('editAYTermIntake')?.value!,
              createdBy: this.userLogged.currentUser?.uid!,
            },
            this.userLogged.currentUser!.uid!
          )
          .subscribe(() => {
            this.editForm.reset();
            this.toggleModal(2, false);
            this.viewAnnouncement();
          });
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  }
}
