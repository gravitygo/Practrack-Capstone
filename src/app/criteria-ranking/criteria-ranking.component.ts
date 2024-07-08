import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { AccountService } from '../services/account.service';
@Component({
  selector: 'app-criteria-ranking',
  templateUrl: './criteria-ranking.component.html',
  styleUrls: ['./criteria-ranking.component.scss'],
})
export class CriteriaRankingComponent {
  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private accServ: AccountService
  ) {}
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;

  submitted = false;
  duplicates = false;
  rankForm = this.fb.group({
    rSelect1: ['', [Validators.required]],
    rSelect2: ['', [Validators.required]],
    rSelect3: ['', [Validators.required]],
    rSelect4: ['', [Validators.required]],
    rSelect5: ['', [Validators.required]],
    rSelect6: ['', [Validators.required]],
    rSelect7: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;
  }

  saveRanking(): void {
    this.submitted = true;
    var r1 = this.rankForm.get('rSelect1')?.value!;
    var r2 = this.rankForm.get('rSelect2')?.value!;
    var r3 = this.rankForm.get('rSelect3')?.value!;
    var r4 = this.rankForm.get('rSelect4')?.value!;
    var r5 = this.rankForm.get('rSelect5')?.value!;
    var r6 = this.rankForm.get('rSelect6')?.value!;
    var r7 = this.rankForm.get('rSelect7')?.value!;

    // Check if all fields filled
    if (
      r1 != '' &&
      r2 != '' &&
      r3 != '' &&
      r4 != '' &&
      r5 != '' &&
      r6 != '' &&
      r7 != ''
    ) {
      var rArray = [r1, r2, r3, r4, r5, r6, r7];

      // Check for duplicates
      if (this.hasDuplicates(rArray)) {
        this.duplicates = true;
      } else {
        this.duplicates = false;
        this.accServ.updateCriteria(this.userID, rArray).subscribe(() => {
          this.router.navigate(['/companylisting']);
        });
      }
    }
  }

  hasDuplicates(arr: any[]): boolean {
    var counts = [];

    for (var i = 0; i <= arr.length; i++) {
      if (counts[arr[i]] === undefined) {
        counts[arr[i]] = 1;
      } else {
        return true;
      }
    }
    return false;
  }
}
