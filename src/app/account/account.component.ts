import { Component, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { LoadingService } from '../services/loading.service';
import { regions, provinces, municipalities } from 'psgc';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { CoorTurnoverService } from 'src/app/services/coor-turnover.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  userID: any;
  isModalOpen = false;
  idNum = 0;
  account: any;
  interests: any;
  workSetup: any;
  jobList: any;
  locRegions = regions.all();
  locProvinces = provinces.all();
  chosenProvinces: any[] = [];
  locCities = municipalities.all();
  chosenCities: any[] = [];
  submitted = false;
  failed = false;
  success = false;
  email: any;
  role: BehaviorSubject<string> = new BehaviorSubject('');
  toggleTurnover = false;

  constructor(
    private fb: FormBuilder,
    private accountServ: AccountService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private turnoverServ: CoorTurnoverService,
    private router: Router
  ) {
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });

    this.turnoverServ.coorTurnoverBool().subscribe((value) => {
      this.toggleTurnover = value;
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  accountForm = this.fb.group({
    accFirstName: { value: '', disabled: true },
    accFirstCoor: { value: '', disabled: true },
    accLastName: { value: '', disabled: true },
    accLastCoor: { value: '', disabled: true },
    accEmail: { value: '', disabled: true },
    accIdNum: { value: '', disabled: true },
    accDegree: { value: '', disabled: true },
    accLocRegion: { value: '', disabled: true },
    accLocProvince: { value: '', disabled: true },
    accLocCity: ['', [Validators.required]],
    accDeployment: { value: '', disabled: true },
    accStartDate: { value: '', disabled: true },
    accEndDate: { value: '', disabled: true },
    accPrimaryInterest: ['', [Validators.required]],
    accJobPosition: ['', [Validators.required]],
    accWorkSetup: ['', [Validators.required]],
    accCompany: { value: '', disabled: true },
  });

  locForm = this.fb.group({
    accRegion: [''],
    accProvince: [''],
    accCity: [''],
  });

  turnoverForm = this.fb.group({
    turnoverEmail: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;
    this.role.subscribe({
      next: (value) => {
        console.log(value); // Log the value when it changes
        try {
          this.loadingService.showLoading();
          this.viewAccount(this.userID);
        } catch (err) {
          console.log(err);
        } finally {
          this.loadingService.hideLoading();
        }
      },
      error: (error) => {
        console.error('Subscription error:', error);
      },
    });
  }

  ngAfterViewInit(): void {}

  toggleModal(idNum: number, isModalOpen?: boolean) {
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;

    console.log(this.isModalOpen);
    if (this.account.addrRegion != null) {
      this.locForm.setValue({
        accRegion: this.account.addrRegion,
        accProvince: this.account.addrProvince,
        accCity: this.account.addrCity,
      });
      var region = this.locForm.get('accRegion')?.value!;

      if (region !== '') {
        var j = 0;
        for (var i = 0; i < this.locProvinces.length; i++) {
          if (this.locProvinces[i].region == region) {
            this.chosenProvinces[j] = this.locProvinces[i];
            j++;
          }
        }
      }

      var province = this.locForm.get('accProvince')?.value!;
      if (province !== '') {
        var l = 0;
        for (var k = 0; k < this.locCities.length; k++) {
          if (this.locCities[k].province == province) {
            this.chosenCities[l] = this.locCities[k];
            l++;
          }
        }
      }
    } else {
      this.locForm.get('accProvince')?.disable();
      this.locForm.get('accCity')?.disable();
    }
    this.locForm.get('accRegion')?.valueChanges.subscribe((x) => {
      var region = this.locForm.get('accRegion')?.value!;

      if (region !== '') {
        this.chosenProvinces = [];
        var j = 0;
        for (var i = 0; i < this.locProvinces.length; i++) {
          if (this.locProvinces[i].region == region) {
            this.chosenProvinces[j] = this.locProvinces[i];
            j++;
          }
        }
        this.locForm.get('accProvince')?.enable();
        var provinceStr = <string>this.chosenProvinces[0].name;
        this.locForm.get('accProvince')?.setValue(provinceStr);
      }
    });

    this.locForm.get('accProvince')?.valueChanges.subscribe((x) => {
      var province = this.locForm.get('accProvince')?.value!;
      if (province !== '') {
        this.chosenCities = [];
        var l = 0;
        for (var k = 0; k < this.locCities.length; k++) {
          if (this.locCities[k].province == province) {
            this.chosenCities[l] = this.locCities[k];
            l++;
          }
        }
        this.locForm.get('accCity')?.enable();
      }
    });
  }

  viewAccount(userID: string) {
    console.log(this.role.getValue());
    if (this.role.getValue() == 'student') {
      this.accountServ.viewAccount(userID).subscribe((response) => {
        console.log('===========STUDENT VIEW ACCOUNT============');
        console.log(response);
        this.account = response.account[0];
        this.interests = response.interests;
        this.workSetup = response.workSetup;
        this.jobList = response.jobs;

        this.accountForm.patchValue({
          accFirstName: this.account.firstName,
          accLastName: this.account.lastName,
          accEmail: this.account.email,
          accIdNum: this.account.studentID,
          accDegree: this.account.degreeCode,
          accLocRegion: this.account.addrRegion,
          accLocProvince: this.account.addrProvince,
          accLocCity: this.account.addrCity,
          accDeployment: this.account.ojtPhase,
          accStartDate: 'N/A',
          accEndDate: 'N/A',
          accCompany: 'N/A',
        });
        this.accountForm
          .get('accPrimaryInterest')
          ?.setValue(this.account.fieldID);
        this.accountForm
          .get('accJobPosition')
          ?.setValue(this.account.jobPrefID);
        this.accountForm.get('accWorkSetup')?.setValue(this.account.workSetup);
      });
    } else if (this.role.getValue() == 'coordinator') {
      console.log('VIEW');

      this.accountServ.viewAccountCoor(userID).subscribe((response) => {
        console.log('===========COORDINATOR VIEW ACCOUNT============');
        console.log(response);
        this.account = response.account[0];

        this.accountForm.patchValue({
          accFirstCoor: this.account.firstName,
          accLastCoor: this.account.lastName,
          accEmail: this.account.email,
        });
      });
    }
  }

  updateAccount(userID: string) {
    this.submitted = true;
    try {
      if (this.accountForm.valid) {
        this.accountServ
          .updateAccount(userID, {
            fieldID: Number(this.accountForm.get('accPrimaryInterest')?.value!),
            addrRegion: this.accountForm.get('accLocRegion')?.value!,
            addrProvince: this.accountForm.get('accLocProvince')?.value!,
            addrCity: this.accountForm.get('accLocCity')?.value!,
            workSetup: this.accountForm.get('accWorkSetup')?.value!,
            jobPosition: this.accountForm.get('accJobPosition')?.value!,
          })
          .subscribe(() => {
            window.location.reload();
          });
        this.openSnackBar('Account updated', 'Confirm');
      }
    } catch (err) {
      console.log('Error: ', err);
    }
  }

  updateLocation() {
    this.accountForm.patchValue({
      accLocRegion: this.locForm.get('accRegion')?.value!,
      accLocProvince: this.locForm.get('accProvince')?.value!,
      accLocCity: this.locForm.get('accCity')?.value!,
    });
    this.toggleModal(1, false);
  }

  capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  separateAndCapitalize(email: string): {
    firstName: string;
    lastName: string;
  } {
    // Split email by '@' symbol to extract the name part
    const parts = email.split('@');

    // Extract the name part
    const namePart = parts[0];

    // Split the name part by '_' symbol to separate first and last names
    const nameParts = namePart.split('_');

    // Capitalize first letter of each name part
    const firstName = this.capitalizeFirstLetter(nameParts[0]);
    const lastName = this.capitalizeFirstLetter(nameParts[1]);

    return { firstName, lastName };
  }

  turnoverCoor() {
    this.submitted = true;
    this.email = this.turnoverForm.get('turnoverEmail')?.value!;

    const separatedNames = this.separateAndCapitalize(this.email);
    const { firstName, lastName } = separatedNames;

    // Account creation
    if (this.turnoverForm.valid) {
      console.log(firstName);
      console.log(lastName);
      this.loadingService.showLoading();
      // Admin auth createUser function
      this.accountServ
        .createCoordinator(this.userID, {
          email: this.email,
        })
        .subscribe((status) => {
          // If not existing in firebase yet
          if (status.status.success == true) {
            // Inserting coor into DB
            this.accountServ
              .turnoverCoordinator(this.userID, {
                userID: status.status.createdUID,
                firstName: firstName,
                lastName: lastName,
                email: this.email,
                isActive: true,
                roles: 'Coordinator',
              })
              .subscribe((response) => {
                console.log(response);
                sendPasswordResetEmail(this.auth, this.email)
                  .then(() => {
                    this.success = true;
                  })
                  .catch((error) => {
                    console.log(error);
                  })
                  .finally(() => this.loadingService.hideLoading());
              });
          } else {
            this.failed = true;
            this.loadingService.hideLoading();
          }
        });
    }
    console.log('Form submitted:', this.turnoverForm.value);
  }

  deleteAccount() {
    console.log('DELETING ACCOUNT...');
    console.log(this.userLogged.currentUser!);
    this.loadingService.showLoading();
    this.accountServ
      .deleteAccount(this.userLogged.currentUser!)
      .subscribe((response) => {
        try {
          // success
          console.log('success: ' + response.status);
          alert('Account deactivated successfully.');
          this.router.navigate(['login']);
        } catch (error) {
          console.log(error);
        } finally {
          this.loadingService.hideLoading();
        }
      });
  }
}
