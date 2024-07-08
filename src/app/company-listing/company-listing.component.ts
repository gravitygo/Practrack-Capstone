import {
  Component,
  inject,
  ViewChild,
  OnInit,
  ElementRef,
  Renderer2,
} from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { CompanyListingService } from '../services/company-listing.service';
import { JobMatchingService } from '../services/job-matching.service';
import { Auth } from '@angular/fire/auth';
import { LoadingService } from '../services/loading.service';
import { SupabaseService } from '../services/supabase.service';
import { regions, provinces, municipalities } from 'psgc';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject } from 'rxjs';
import { valueOrDefault } from 'chart.js/dist/helpers/helpers.core';
import { SnackbarService } from '../services/snackbar.service';

@Component({
  selector: 'app-company-listing',
  templateUrl: './company-listing.component.html',
  styleUrls: ['./company-listing.component.scss'],
})
export class CompanyListingComponent implements OnInit {
  // User Logged
  private auth: Auth = inject(Auth);
  userLogged = this.auth;
  role: BehaviorSubject<string> = new BehaviorSubject('');

  // Paginator ViewChild
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // INITIATE DEFAULT VARIABLES
  userID: any;
  isModalOpen = false;
  companyID = 0;
  idNum = 0;
  deleteCheckbox: boolean = false;
  editForm: FormGroup;
  locRegions = regions.all();
  locProvinces = provinces.all();
  chosenProvinces: any[] = [];
  locCities = municipalities.all();
  chosenCities: any[] = [];
  nature: any;
  selectedContact: any[] = [];
  countContact = 0; // Counter for Add Contact
  indexCount = 0; // Counter for Edit Contact

  jobList: any;
  profile: any;
  worksetup: any;
  // Job Matching Variables
  companySheets: any;
  companyDB: any;
  defaultWeights: any[] = [0.1, 0.13, 0.12, 0.14, 0.15, 0.2, 0.16];
  companiesScores: { [key: string]: any } = {};
  studentsCompanyScores: { [key: string]: any } = {};
  companyScore: any[] = [];
  runningTotal = 0;
  nRelevance = 0;
  nScope = 0;
  nCareer = 0;
  filteredSheets: any[] = [];
  studentID: any;

  // Paginator Variables
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  addForm: FormGroup = this.fb.group({
    addName: ['', Validators.required],
    addAddress: ['', Validators.required],
    addRegion: ['', Validators.required],
    addProvince: { value: '', disabled: true, required: true },
    addCity: { value: '', disabled: true, required: true },
    addNature: ['', Validators.required],
    addEndDate: ['', Validators.required],
    addAllowance: [false],
    addContacts: this.fb.array([]),
    addJobs: this.fb.array([]),
    addWorkSetup: ['', Validators.required],
  });

  deleteForm: FormGroup = this.fb.group({
    deleteCompany: { value: '', disabled: true },
    deleteAddress: { value: '', disabled: true },
    deleteEndDate: { value: '', disabled: true },
  });

  // SEARCH variable for Searchtext
  searchText: any;
  filteredCompanyListing: any[] = [];
  allCompanyListing: any[] = [];

  submitted = false;

  activeStudents: any[] = [];
  activeChats: any[] = [];
  companyToDelete: string = '';

  //Constructor for companyListingService
  constructor(
    private fb: FormBuilder,
    private companyListingServ: CompanyListingService,
    private router: Router,
    private loadingService: LoadingService,
    private supabaseService: SupabaseService,
    private jobServ: JobMatchingService,
    private elRef: ElementRef, // constructor for hover
    private renderer: Renderer2, // constructor for hover,
    private snack: SnackbarService
  ) {
    this.editForm = this.fb.group({
      editName: ['', Validators.required],
      editAddress: ['', Validators.required],
      editRegion: ['', Validators.required],
      editProvince: { value: '', disabled: true, required: true },
      editCity: { value: '', disabled: true, required: true },
      editNature: [''],
      editEndDate: [''],
      editAllowance: [''],
      editContacts: this.fb.array([]),
      editJobs: this.fb.array([]),
      editWorkSetup: ['', Validators.required],
    });
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });
  }

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;
    this.viewCompanyList(this.userID);

    // LISTENER
    this.supabaseService.getCompanies().subscribe(() => {
      this.viewCompanyList(this.userID);
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Extract date part in 'YYYY-MM-DD' format
  }

  toggleRowExpansion(companylist: any): void {
    companylist.expanded = !companylist.expanded;

    /*
    // Limit expansion to one row at a time
    this.filteredCompanyListing.forEach((item) => {
      if (item !== companylist) {
        item.expanded = false;
      }
    });
    */
  }

  // SEARCH Filter function
  filterData(): void {
    if (!this.searchText) {
      this.filteredCompanyListing = this.allCompanyListing.slice();
    } else {
      this.filteredCompanyListing = this.allCompanyListing.filter((company) => {
        const cleanedCompany = this.removeExcludedKeys(company);
        return JSON.stringify(cleanedCompany)
          .toLowerCase()
          .includes(this.searchText.toLowerCase());
      });
    }
  }

  // Removes unnecessary keys for search filter
  removeExcludedKeys(company: any): any {
    const cleanedCompany: any = {};
    const excludedKeys: string[] = [
      'companyID',
      'createdBy',
      'lastEditedBy',
      'dateCreated',
      'dateLastEdited',
      'dssAveRating',
      'effectivityEndDate',
      'hasAllowance',
      'isActivePartner',
      'natureOfCompany',
      'workSetup',
    ];

    for (const key in company) {
      if (!excludedKeys.includes(key)) {
        if (
          typeof company[key] === 'object' &&
          !Array.isArray(company[key]) &&
          company[key] !== null
        ) {
          cleanedCompany[key] = this.removeExcludedKeys(company[key]);
        } else {
          cleanedCompany[key] = company[key];
        }
      }
    }
    return cleanedCompany;
  }

  // Changes when Search is initiated
  ngOnChanges(): void {
    this.filterData();
  }

  // Modal Logic for HTML
  toggleModal(idNum: number, isModalOpen?: boolean, companyID?: number) {
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;

    if (companyID !== undefined) {
      this.companyID = companyID;
      this.viewCompanyModal(companyID);
    }

    if (idNum == 1) {
      this.countContact = 0;
      // Add Form
      this.addForm.get('addProvince')?.disable();
      this.addForm.get('addCity')?.disable();
      this.addForm.get('addRegion')?.valueChanges.subscribe((x) => {
        var region = this.addForm.get('addRegion')?.value!;
        if (region !== '') {
          this.chosenProvinces = [];
          var j = 0;
          for (var i = 0; i < this.locProvinces.length; i++) {
            if (this.locProvinces[i].region == region) {
              this.chosenProvinces[j] = this.locProvinces[i];
              j++;
            }
          }
          this.addForm.get('addProvince')?.enable();
          var provinceStr = <string>this.chosenProvinces[0].name;
          this.addForm.get('addProvince')?.setValue(provinceStr);
        }
      });
      this.addForm.get('addProvince')?.valueChanges.subscribe((x) => {
        var province = this.addForm.get('addProvince')?.value!;
        if (province !== '') {
          this.chosenCities = [];
          var l = 0;
          for (var k = 0; k < this.locCities.length; k++) {
            if (this.locCities[k].province == province) {
              this.chosenCities[l] = this.locCities[k];
              l++;
            }
          }
          this.addForm.get('addCity')?.enable();
        }
      });
    } else if (idNum == 2) {
      // Edit Form
      this.editForm.get('editProvince')?.disable();
      this.editForm.get('editCity')?.disable();
      this.editForm.get('editRegion')?.valueChanges.subscribe((x) => {
        var region = this.editForm.get('editRegion')?.value!;
        if (region !== '') {
          var j = 0;
          for (var i = 0; i < this.locProvinces.length; i++) {
            if (this.locProvinces[i].region == region) {
              this.chosenProvinces[j] = this.locProvinces[i];
              j++;
            }
          }
          this.editForm.get('editProvince')?.reset();
          this.editForm.get('editProvince')?.enable();
        }
      });
      this.editForm.get('editProvince')?.valueChanges.subscribe((x) => {
        var province = this.editForm.get('editProvince')?.value!;
        if (province !== '') {
          var l = 0;
          for (var k = 0; k < this.locCities.length; k++) {
            if (this.locCities[k].province == province) {
              this.chosenCities[l] = this.locCities[k];
              l++;
            }
          }
          this.editForm.get('editCity')?.enable();
        }
      });
    } else if (idNum == 4) {
      this.loadingService.hideLoading();
    }
  }

  // ADD Company in Forms
  addCompany() {
    var contactArray: { [key: string]: any } = {};
    var dataPhone: { [key: string]: any } = {};
    var dataEmail: { [key: string]: any } = {};
    var dataWebsite: { [key: string]: any } = {};
    var contactData;

    var key1 = 'contacts';
    var key2 = 'phone';
    var key3 = 'email';
    var key4 = 'website';

    contactArray[key1] = [];
    dataPhone[key2] = [];
    dataEmail[key3] = [];
    dataWebsite[key4] = [];

    this.selectedContact.forEach((contact, index) => {
      if (contact === 'phone') {
        contactData = this.addForm.get('addContacts')?.value.at(index);
        dataPhone[key2].push(contactData);
      } else if (contact === 'email') {
        (contactData = this.addForm.get('addContacts')?.value.at(index)),
          dataEmail[key3].push(contactData);
      } else if (contact === 'website') {
        (contactData = this.addForm.get('addContacts')?.value.at(index)),
          dataWebsite[key4].push(contactData);
      }
    });
    contactArray[key1].push(dataPhone);
    contactArray[key1].push(dataEmail);
    contactArray[key1].push(dataWebsite);

    this.submitted = true;
    try {
      if (this.addForm.valid) {
        var contactArray: { [key: string]: any } = {};
        var dataPhone: { [key: string]: any } = {};
        var dataEmail: { [key: string]: any } = {};
        var dataWebsite: { [key: string]: any } = {};
        var contactData;

        var key1 = 'contacts';
        var key2 = 'phone';
        var key3 = 'email';
        var key4 = 'website';

        contactArray[key1] = [];
        dataPhone[key2] = [];
        dataEmail[key3] = [];
        dataWebsite[key4] = [];

        this.selectedContact.forEach((contact, index) => {
          if (contact === 'phone') {
            contactData = this.addForm.get('addContacts')?.value.at(index);
            dataPhone[key2].push(contactData);
          } else if (contact === 'email') {
            (contactData = this.addForm.get('addContacts')?.value.at(index)),
              dataEmail[key3].push(contactData);
          } else if (contact === 'website') {
            (contactData = this.addForm.get('addContacts')?.value.at(index)),
              dataWebsite[key4].push(contactData);
          }
        });
        contactArray[key1].push(dataPhone);
        contactArray[key1].push(dataEmail);
        contactArray[key1].push(dataWebsite);

        try {
          this.companyListingServ
            .addCompanyListing({
              companyName: this.addForm.value['addName']!,
              companyAddress: this.addForm.value['addAddress']!,
              natureOfCompany: this.addForm.value['addNature']!,
              effectivityEndDate: this.addForm.value['addEndDate'],
              hasAllowance: this.addForm.value['addAllowance']!,
              pointOfContact: contactArray,
              isActivePartner: true,
              createdBy: this.userLogged.currentUser?.uid!,
              addrRegion: this.addForm.get('addRegion')?.value!,
              addrProvince: this.addForm.get('addProvince')?.value!,
              addrCity: this.addForm.get('addCity')?.value!,
              jobPositions: this.addForm.get('addJobs')?.value!,
              workSetup: this.addForm.get('addWorkSetup')?.value!,
            })
            .subscribe(() => {
              this.addForm.reset(); //resets the forms
              this.toggleModal(1, false); //removes the modal
              this.selectedContact = [];
              this.snack.openSnackBar(
                'Company has been added successfully.',
                '',
                'Success'
              );
              this.viewCompanyList(this.userID);
            });
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // VIEWS the company modal when editing
  viewCompanyModal(companyID: number) {
    try {
      this.companyListingServ.viewCompanyModal(companyID).subscribe((res) => {
        var company = res.viewCompanyModal[0];
        if (this.idNum == 2) {
          this.clearFormArray(this.jobsEdit);

          var companyJobs: any[] = company.jobList;
          var companyContacts: any[] = company.pointOfContact.contacts;

          // Retrieving jobs
          if (companyJobs) {
            companyJobs.forEach((element, index) => {
              this.addJob(2);
              this.jobsEdit.controls[index].patchValue(element.jobID);
            });
          }

          // Retrieving contacts
          if (companyContacts) {
            this.clearFormArray(this.contactsEdit);
            this.indexCount = 0;

            var companyPhones: any[] = companyContacts[0].phone;
            var companyEmails: any[] = companyContacts[1].email;
            var companyWebsites: any[] = companyContacts[2].website;

            if (companyPhones.length > 0) {
              companyPhones.forEach((element) => {
                this.addContact('phone', 2);
                this.contactsEdit.controls[this.indexCount - 1].patchValue(
                  element
                );
              });
            }
            if (companyEmails.length > 0) {
              companyEmails.forEach((element) => {
                this.addContact('email', 2);
                this.contactsEdit.controls[this.indexCount - 1].patchValue(
                  element
                );
              });
            }
            if (companyWebsites.length > 0) {
              companyWebsites.forEach((element) => {
                this.addContact('website', 2);
                this.contactsEdit.controls[this.indexCount - 1].patchValue(
                  element
                );
              });
            }
          }
          this.editForm.patchValue({
            editName: company.companyName,
            editAddress: company.companyAddress,
            editRegion: company.addrRegion,
            editProvince: company.addrProvince,
            editCity: company.addrCity,
            editEndDate: company.effectivityEndDate,
            editAllowance: company.hasAllowance,
          });
          this.editForm.get('editNature')?.setValue(company.natureOfCompany);
          this.editForm.get('editWorkSetup')?.setValue(company.workSetup);
        } else if (this.idNum == 3) {
          this.deleteForm.patchValue({
            deleteCompany: company.companyName,
            deleteAddress: company.companyAddress,
            deleteEndDate: this.formatDate(company.effectivityEndDate),
          });
        }
        this.viewCompanyList(this.userID);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // SAVE the edited company
  saveCompany(companyID: number) {
    try {
      var contactArray: { [key: string]: any } = {};
      var dataPhone: { [key: string]: any } = {};
      var dataEmail: { [key: string]: any } = {};
      var dataWebsite: { [key: string]: any } = {};
      var contactData;

      var key1 = 'contacts';
      var key2 = 'phone';
      var key3 = 'email';
      var key4 = 'website';

      contactArray[key1] = [];
      dataPhone[key2] = [];
      dataEmail[key3] = [];
      dataWebsite[key4] = [];

      this.selectedContact.forEach((contact, index) => {
        if (contact === 'phone') {
          contactData = this.editForm.get('editContacts')?.value.at(index);
          dataPhone[key2].push(contactData);
        } else if (contact === 'email') {
          (contactData = this.editForm.get('editContacts')?.value.at(index)),
            dataEmail[key3].push(contactData);
        } else if (contact === 'website') {
          (contactData = this.editForm.get('editContacts')?.value.at(index)),
            dataWebsite[key4].push(contactData);
        }
      });
      contactArray[key1].push(dataPhone);
      contactArray[key1].push(dataEmail);
      contactArray[key1].push(dataWebsite);

      this.submitted = true;
      if (this.editForm.valid) {
        this.companyListingServ
          .saveCompany(companyID, {
            companyName: this.editForm.get('editName')?.value!,
            companyAddress: this.editForm.get('editAddress')?.value!,
            natureOfCompany: this.editForm.get('editNature')?.value!,
            effectivityEndDate: this.editForm.get('editEndDate')?.value!,
            hasAllowance: this.editForm.get('editAllowance')?.value!,
            isActivePartner: true,
            createdBy: this.userLogged.currentUser?.uid!,
            addrRegion: this.editForm.get('editRegion')?.value!,
            addrProvince: this.editForm.get('editProvince')?.value!,
            addrCity: this.editForm.get('editCity')?.value!,
            jobPositions: this.editForm.get('editJobs')?.value!,
            pointOfContact: contactArray,
            workSetup: this.editForm.get('editWorkSetup')?.value!,
          })
          .subscribe(() => {
            this.editForm.reset();
            this.toggleModal(2, false);
            this.viewCompanyList(this.userID);
            this.selectedContact = [];
            this.snack.openSnackBar(
              'Company has been updated successfully.',
              '',
              'Success'
            );
          });
        //shows loading icon
      }
    } catch (err) {
      console.error(err);
    }
  }

  // DELETE the company
  deleteCompany(companyID: number) {
    try {
      this.companyListingServ
        .deleteCompany(companyID, this.userLogged.currentUser!.uid!)
        .subscribe((res) => {
          this.activeChats = res.deleteCompany.chats;
          this.activeStudents = res.deleteCompany.students;
          if (this.activeChats.length == 0 && this.activeStudents.length == 0) {
            this.editForm.reset();
            this.toggleModal(3, false);
            this.viewCompanyList(this.userID);
            this.snack.openSnackBar(
              'Company has been deleted successfully.',
              '',
              'Info'
            );
          } else {
            this.companyListingServ
              .viewCompanyModal(companyID)
              .subscribe((res) => {
                this.companyToDelete = res.viewCompanyModal[0].companyName;
              });

            this.toggleModal(4, true);
          }
        });
      this.loadingService.showLoading(); //shows loading icon
    } catch (err) {
      console.error(err);
    }
  }

  // VIEW Company List
  viewCompanyList(userID: string) {
    try {
      this.loadingService.showLoading();
      this.companyListingServ.viewCompanyList(userID).subscribe((response) => {
        this.allCompanyListing = response.companylist;
        this.nature = response.nature;
        this.jobList = response.jobs;
        this.profile = response.profile[0];
        this.worksetup = response.worksetup;
        this.filterData(); // Ensure data is filtered initially
        this.jobServ.getCompanySheets().subscribe((response) => {
          this.companySheets = response.companySheets;
          this.companyDB = response.companyDB;
          if (this.role.getValue() == 'student') {
            this.computeMFEP();
          }
          this.loadingService.hideLoading(); // Hide loading indicator
        });
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Address will expand when the mouse is hovered

  get contactControls() {
    return (<FormArray>this.addForm.get('addContacts')).controls;
  }

  get contacts() {
    return this.addForm.get('addContacts') as FormArray;
  }

  get contactControlsEdit() {
    return (<FormArray>this.editForm.get('editContacts')).controls;
  }

  get contactsEdit() {
    return this.editForm.get('editContacts') as FormArray;
  }

  addContact(selected: string, modal: number) {
    const ctrl = new FormControl(null);
    if (modal === 1) {
      // Add Modal
      this.selectedContact[this.countContact] = selected;
      this.countContact++;
      (<FormArray>this.addForm.get('addContacts')).push(ctrl);
    } else if (modal === 2) {
      // Edit Modal
      this.selectedContact[this.indexCount] = selected;
      this.indexCount++;
      (<FormArray>this.editForm.get('editContacts')).push(ctrl);
    }
  }

  removeContact(i: number, modal: number) {
    if (modal == 1) {
      //Add modal
      this.contacts.removeAt(i);
      this.countContact--;
    } else if (modal == 2) {
      //Edit modal
      this.contactsEdit.removeAt(i);
      this.indexCount--;
    }
    this.selectedContact.splice(i, 1);
  }

  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  get jobControls() {
    return (<FormArray>this.addForm.get('addJobs')).controls;
  }

  get jobs() {
    return this.addForm.get('addJobs') as FormArray;
  }

  get jobControlsEdit() {
    return (<FormArray>this.editForm.get('editJobs')).controls;
  }

  get jobsEdit() {
    return this.editForm.get('editJobs') as FormArray;
  }

  addJob(modal: number) {
    const ctrl = new FormControl(null);
    if (modal == 1) {
      // Add Modal opened

      (<FormArray>this.addForm.get('addJobs')).push(ctrl);
    } else if (modal == 2) {
      // Edit Modal opened
      (<FormArray>this.editForm.get('editJobs')).push(ctrl);
    }
  }

  removeJob(i: number, modal: number) {
    if (modal == 1) {
      //Add modal
      this.jobs.removeAt(i);
    } else if (modal == 2) {
      //Edit modal
      this.jobsEdit.removeAt(i);
    }
  }

  isPastDate(dateString: string): boolean {
    const today = new Date();
    const endDate = new Date(dateString);
    return endDate < today;
  }

  computeMFEP(): void {
    // Initialize studentsCompanyScores as an empty object
    this.studentsCompanyScores = {};
    var student = this.profile;
    this.studentID = student.studentID;
    var studentRegion = student.addrRegion;
    var studentProvince = student.addrProvince;
    var studentCity = student.addrCity;
    var studentSetup = student.workSetup;
    var studentField = student.fieldID;
    var studentAllowance = student.allowance;
    var studentWeights: number[] = [];

    // Determine if criteria is custom/default
    if (student.prefRank == null) {
      studentWeights = this.defaultWeights;
    } else {
      // Convert prefRank to weights
      console.log('Meron');
      student.prefRank.forEach((pref: number) => {
        switch (pref) {
          case 1:
            studentWeights.push(0.2);
            break;
          case 2:
            studentWeights.push(0.16);
            break;
          case 3:
            studentWeights.push(0.15);
            break;
          case 4:
            studentWeights.push(0.14);
            break;
          case 5:
            studentWeights.push(0.13);
            break;
          case 6:
            studentWeights.push(0.12);
            break;
          case 7:
            studentWeights.push(0.1);
            break;
          default:
            break;
        }
      });
    }

    var moreRows;
    var lessRows;

    // Filter if company is in sheets and in db
    if (this.companySheets.length > this.companyDB.length) {
      moreRows = this.companySheets;
      lessRows = this.companyDB;
    } else {
      moreRows = this.companyDB;
      lessRows = this.companySheets;
    }

    for (let i = 0; i < moreRows.length; i++) {
      var outerKey;
      if (moreRows[i][0] == null) {
        outerKey = moreRows[i].companyName;
      } else if (moreRows[i].companyName == null) {
        outerKey = moreRows[i][0];
      }
      for (let j = 0; j < lessRows.length; j++) {
        var innerKey;
        if (lessRows[j][0] == null) {
          innerKey = lessRows[j].companyName;
        } else if (lessRows[j].companyName == null) {
          innerKey = lessRows[j][0];
        }
        // Compare company names
        if (outerKey == innerKey) {
          // check which is from sheets
          if (moreRows[i][0] == null) {
            lessRows[j]['dbData'] = moreRows[i];
            this.filteredSheets.push(lessRows[j]);
          } else {
            moreRows[i]['dbData'] = lessRows[j];

            this.filteredSheets.push(moreRows[i]);
          }
        }
      }
    }

    // Quantify generic company data
    for (let i = 0; i < this.filteredSheets.length; i++) {
      // Scores from sheets
      var key = this.filteredSheets[i][0];
      // Normalize values
      this.nRelevance = this.filteredSheets[i][6] * studentWeights[0];
      this.nScope = this.filteredSheets[i][10] * studentWeights[1];
      this.nCareer = this.filteredSheets[i][12] * studentWeights[2];
      this.companyScore = [];
      this.companiesScores[key] = [];
      this.companyScore.push(this.nRelevance);
      this.companyScore.push(this.nScope);
      this.companyScore.push(this.nCareer);
      this.companiesScores[key].push(this.companyScore);
    }

    // Initialize an empty object to hold scores for each student
    this.studentsCompanyScores[this.studentID] = {};
    // Reset additional properties
    student['recField'] = '';
    student['recCompany'] = '';
    student['companyRate'] = '';

    // Quantify specific company data
    for (let i = 0; i < this.filteredSheets.length; i++) {
      var companyRegion = this.filteredSheets[i].dbData.addrRegion;
      var companyProvince = this.filteredSheets[i].dbData.addrProvince;
      var companyCity = this.filteredSheets[i].dbData.addrCity;
      var companyAllowance = this.filteredSheets[i].dbData.hasAllowance;

      var key = this.filteredSheets[i].dbData.companyName;

      // Initialize an empty object to hold scores for each company for this student
      this.studentsCompanyScores[this.studentID][key] = [];

      var locScore = 1;
      var setupScore = 1;
      var fieldScore = 1;
      var paidScore = 1;

      // Location score calculation
      if (companyCity === studentCity) {
        locScore = 4;
      } else if (companyProvince === studentProvince) {
        locScore = 3;
      } else if (companyRegion === studentRegion) {
        locScore = 2;
      }

      // Setup score calculation
      if (studentSetup === this.filteredSheets[i].dbData.worksetupstr) {
        setupScore = 4;
      } else if (studentSetup === 'Any') {
        setupScore = 2;
      }

      // Field score calculation
      var companyField = this.filteredSheets[i].dbData.natureOfCompany;
      if (studentField == companyField) {
        fieldScore = 4;
      } else if (
        (studentField == 1 || studentField == 2) &&
        (companyField == 1 || companyField == 2)
      ) {
        fieldScore = 2;
      } else if (
        (studentField == 3 || studentField == 4) &&
        (companyField == 3 || companyField == 4)
      ) {
        fieldScore = 2;
      } else if (
        (studentField == 5 || studentField == 6) &&
        (companyField == 5 || companyField == 6)
      ) {
        fieldScore = 2;
      }

      // Allowance score calculation
      if (
        (studentAllowance == 1 && companyAllowance == true) ||
        (studentAllowance == 2 && companyAllowance == false)
      ) {
        paidScore = 4;
      } else if (studentAllowance == 3 && companyAllowance == true) {
        paidScore = 3;
      } else if (studentAllowance == 3 && companyAllowance == false) {
        paidScore = 2;
      }

      // Assign normalized scores to the object
      this.studentsCompanyScores[this.studentID][key]['locScore'] =
        locScore * studentWeights[3];
      this.studentsCompanyScores[this.studentID][key]['setupScore'] =
        setupScore * studentWeights[4];
      this.studentsCompanyScores[this.studentID][key]['fieldScore'] =
        fieldScore * studentWeights[5];
      this.studentsCompanyScores[this.studentID][key]['paidScore'] =
        paidScore * studentWeights[6];

      this.runningTotal = 0;
      this.runningTotal = this.nRelevance + this.nScope + this.nCareer;
      this.runningTotal +=
        this.studentsCompanyScores[this.studentID][key]['locScore'];
      this.runningTotal +=
        this.studentsCompanyScores[this.studentID][key]['setupScore'];
      this.runningTotal +=
        this.studentsCompanyScores[this.studentID][key]['fieldScore'];
      this.runningTotal +=
        this.studentsCompanyScores[this.studentID][key]['paidScore'];

      this.studentsCompanyScores[this.studentID][key].push(
        this.companiesScores[key]
      );
      this.studentsCompanyScores[this.studentID][key].push(this.runningTotal);
    }
    this.studentsCompanyScores[this.studentID] = this.rankCompanies(
      this.studentsCompanyScores[this.studentID]
    );
    this.profile['recCompany'] =
      this.studentsCompanyScores[this.studentID][0][0];
    var convRate = (
      (this.studentsCompanyScores[this.studentID][0][1][1] / 4) *
      100
    ).toFixed(2);
    this.profile['companyRate'] = convRate;
  }
  rankCompanies(companyList: any): Array<any[]> {
    // Convert companyList to an array if it's an object
    const companiesArray = Array.isArray(companyList)
      ? companyList
      : Object.entries(companyList).map(([companyName, value]) => [
          companyName,
          value,
        ]);

    // Sort the company list in descending order based on the value you're accessing
    companiesArray.sort(([, a], [, b]) => b[1] - a[1]);

    // console.log(companiesArray);
    return companiesArray;
  }

  viewDetails(): void {
    var data: NavigationExtras = {
      state: {
        student: this.profile,
        rankedCompanies: this.studentsCompanyScores[this.studentID],
      },
    };
    this.router.navigate(['/jobMatching/details'], data);
  }

  getVisibleIndices(): number[] {
    const startIndex = this.paginator?.pageIndex * this.paginator?.pageSize;
    const endIndex = startIndex + this.paginator?.pageSize;
    return Array.from(
      { length: this.filteredCompanyListing.length },
      (_, index) => index
    ).slice(startIndex, endIndex);
  }

  toAccount(): void {
    this.router.navigate(['/account/' + this.userID]);
  }
}
