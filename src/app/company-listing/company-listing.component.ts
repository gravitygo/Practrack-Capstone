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
import { regions, provinces, municipalities } from 'psgc';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject } from 'rxjs';

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
  defaultWeights: any[] = [0.2083, 0.1667, 0.1667, 0.125, 0.125, 0.2083];
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
  currentPage = 0;

  // Handle Page Event for Pagination
  handlePageEvent(pageEvent: PageEvent): void {
    this.currentPage = pageEvent.pageIndex;
    this.paginateData();
  }

  addForm: FormGroup = this.fb.group({
    addName: [''],
    addAddress: [''],
    addRegion: [''],
    addProvince: { value: '', disabled: true },
    addCity: { value: '', disabled: true },
    addNature: [''],
    addEndDate: [''],
    addContacts: this.fb.array([]),
    addJobs: this.fb.array([]),
    addWorkSetup: [''],
  });

  // SEARCH variable for Searchtext
  searchText: any;
  filteredCompanyListing: any[] = [];

  allCompanyListing: any[] = [];
  paginatedCompanyListing: any[] = [];

  //Constructor for companyListingService
  constructor(
    private fb: FormBuilder,
    private companyListingServ: CompanyListingService,
    private router: Router,
    private loadingService: LoadingService,
    private jobServ: JobMatchingService,
    private elRef: ElementRef, // constructor for hover
    private renderer: Renderer2 // constructor for hover
  ) {
    this.editForm = this.fb.group({
      editName: [''],
      editAddress: [''],
      editRegion: [''],
      editProvince: [''],
      editCity: [''],
      editNature: [''],
      editEndDate: [''],
      editContacts: this.fb.array([]),
      editJobs: this.fb.array([]),
      deleteCheckbox: [false],
      editWorkSetup: [''],
    });
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });
  }

  ngOnInit(): void {
    this.userID = this.userLogged.currentUser?.uid!;
    this.viewCompanyList(this.userID);

    this.filterData();
    this.paginateData();
  }

  toggleRowExpansion(companylist: any): void {
    companylist.expanded = !companylist.expanded;
    this.paginatedCompanyListing.forEach((item) => {
      if (item !== companylist) {
        item.expanded = false;
      }
    });
  }

  paginateData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCompanyListing = this.filteredCompanyListing.slice(
      startIndex,
      endIndex
    );
  }

  // SEARCH Filter function
  filterData(): void {
    if (!this.searchText) {
      this.filteredCompanyListing = this.allCompanyListing.slice();
    } else {
      this.filteredCompanyListing = this.allCompanyListing.filter((company) =>
        JSON.stringify(company)
          .toLowerCase()
          .includes(this.searchText.toLowerCase())
      );
    }
    this.paginateData();
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
      console.log('companyID: ', this.companyID);
      if (idNum === 2) {
        this.viewCompanyModal(companyID);
      }
    } else {
      console.log('Company ID is undefined');
    }
    console.log(this.isModalOpen);

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
        // console.log(this.chosenProvinces);
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
    }
  }

  // ADD Company in Forms
  addCompany() {
    console.log('-------------------------');
    this.paginatedCompanyListing.forEach((element) => {
      console.log(element);
    });

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
    this.clearFormArray(this.jobs);

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

    console.log('=================== FINAL DATA ===========');
    console.log(contactArray);
    console.log(this.addForm.get('addJobs')?.value);

    try {
      this.companyListingServ
        .addCompanyListing({
          companyName: this.addForm.value['addName']!,
          companyAddress: this.addForm.value['addAddress']!,
          natureOfCompany: this.addForm.value['addNature']!,
          effectivityEndDate: this.addForm.value['addEndDate']
            ? new Date(this.addForm.value['addEndDate'])
            : new Date(),
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
          this.router.navigate(['companylisting']);
        });
      this.addForm.reset(); //resets the forms
      this.toggleModal(1, false); //removes the modal
      this.loadingService.showLoading(); //shows loading icon
      this.viewCompanyList(this.userID);
      this.selectedContact = [];
    } catch (err) {
      console.log('Error: ', err);
    }
  }

  // VIEWS the company modal when editing
  viewCompanyModal(companyID: number) {
    try {
      this.companyListingServ.viewCompanyModal(companyID).subscribe((res) => {
        if (this.idNum == 2) {
          this.clearFormArray(this.jobsEdit);
          console.log('==========VIEWCOMPANYMODAL===============');
          console.log(res);
          var company = res.viewCompanyModal[0];
          var companyJobs: any[] = company.jobList;
          var companyContacts: any[] = company.pointOfContact.contacts;

          console.log(companyJobs);
          console.log(companyContacts);

          // Retrieving jobs
          if (companyJobs) {
            companyJobs.forEach((element, index) => {
              this.addJob(2);

              this.jobsEdit.controls[index].patchValue(element.jobID);
              console.log(this.jobsEdit.controls[index].value);
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
              console.log('May phone!');
              console.log(companyPhones);
              companyPhones.forEach((element) => {
                this.addContact('phone', 2);
                this.contactsEdit.controls[this.indexCount - 1].patchValue(
                  element
                );
              });
            }
            if (companyEmails.length > 0) {
              console.log('May email!');
              console.log(companyEmails);
              companyEmails.forEach((element) => {
                this.addContact('email', 2);
                this.contactsEdit.controls[this.indexCount - 1].patchValue(
                  element
                );
              });
            }
            if (companyWebsites.length > 0) {
              console.log('May website!');
              console.log(companyWebsites);
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
          });
          this.editForm.get('editNature')?.setValue(company.natureOfCompany);
          this.editForm.get('editWorkSetup')?.setValue(company.workSetup);
          console.log('================NATURE OF COMPANY===============');
          console.log(company.natureOfCompany);
        }
        this.loadingService.showLoading();
        this.viewCompanyList(this.userID);
      });
    } catch (err) {
      console.log('Error: ', err);
    }
  }

  // SAVE the edited company
  saveCompany(companyID: number) {
    try {
      const editEndDate = new Date(this.editForm.get('editEndDate')?.value!);
      console.log('=========== EDIT FORM JOBS FINAL DATA ==================');
      console.log(this.editForm.get('editJobs')?.value!);
      console.log(this.editForm.get('editContacts')?.value!);

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
        console.log('MY INDEX NUMBER IS CURRENTLY: ' + index);
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

      console.log('=================== FINAL DATA ===========');
      console.log(contactArray);
      console.log(this.editForm.get('editJobs')?.value!);
      console.log(
        '================COMPANY DETAILS TO BE SAVED: ==================='
      );
      console.log(this.editForm.get('editName')?.value!);
      console.log(this.editForm.get('editAddress')?.value!);
      console.log(this.editForm.get('editNature')?.value!);

      this.companyListingServ
        .saveCompany(companyID, {
          companyName: this.editForm.get('editName')?.value!,
          companyAddress: this.editForm.get('editAddress')?.value!,
          natureOfCompany: this.editForm.get('editNature')?.value!,
          effectivityEndDate: editEndDate,
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
        });
      this.loadingService.showLoading(); //shows loading icon
    } catch (err) {
      console.log('Error: ', err);
    }
  }

  // DELETE the company
  deleteCompany(companyID: number) {
    try {
      this.companyListingServ
        .deleteCompany(companyID, this.userLogged.currentUser!.uid!)
        .subscribe(() => {
          this.editForm.reset();
          this.toggleModal(3, false);
          this.viewCompanyList(this.userID);
        });
      this.loadingService.showLoading(); //shows loading icon
    } catch (err) {
      console.log('Error DELETING: ', err);
    }
  }

  // VIEW Company List
  viewCompanyList(userID: string) {
    try {
      this.loadingService.showLoading();
      this.companyListingServ.viewCompanyList(userID).subscribe((response) => {
        console.log(response);
        this.allCompanyListing = response.companylist;
        this.nature = response.nature;
        this.jobList = response.jobs;
        this.profile = response.profile[0];
        console.log(this.profile);
        this.worksetup = response.worksetup;
        this.filterData(); // Ensure data is filtered initially
        this.jobServ.getCompanySheets().subscribe((response) => {
          console.log(response);
          this.companySheets = response.companySheets;
          this.companyDB = response.companyDB;
          if (this.role.getValue() == 'student') {
            this.computeMFEP();
          }
          this.loadingService.hideLoading(); // Hide loading indicator
        });
      });
    } catch (err) {
      console.log('Error fetching company list: ', err);
      this.loadingService.hideLoading(); // Ensure loading indicator is hidden in case of error
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
    console.log(selected);

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
    console.log(this.selectedContact);
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
          console.log('Match!');
          console.log(outerKey);
          console.log(innerKey);
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
    console.log(this.filteredSheets);

    // Quantify generic company data
    for (let i = 0; i < this.filteredSheets.length; i++) {
      // Scores from sheets
      var key = this.filteredSheets[i][0];
      // Normalize values
      this.nRelevance = this.filteredSheets[i][6] * this.defaultWeights[0];
      this.nScope = this.filteredSheets[i][10] * this.defaultWeights[1];
      this.nCareer = this.filteredSheets[i][12] * this.defaultWeights[2];
      this.companyScore = [];
      this.companiesScores[key] = [];
      this.companyScore.push(this.nRelevance);
      this.companyScore.push(this.nScope);
      this.companyScore.push(this.nCareer);
      this.companiesScores[key].push(this.companyScore);
    }

    this.studentID = student.studentID;
    var studentRegion = student.addrRegion;
    var studentProvince = student.addrProvince;
    var studentCity = student.addrCity;
    var studentSetup = student.workSetup;
    var studentField = student.fieldID;

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

      var key = this.filteredSheets[i].dbData.companyName;

      // Initialize an empty object to hold scores for each company for this student
      this.studentsCompanyScores[this.studentID][key] = [];

      var locScore = 1;
      var setupScore = 1;
      var fieldScore = 1;

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

      // Assign normalized scores to the object
      this.studentsCompanyScores[this.studentID][key]['locScore'] =
        locScore * this.defaultWeights[3];
      this.studentsCompanyScores[this.studentID][key]['setupScore'] =
        setupScore * this.defaultWeights[4];
      this.studentsCompanyScores[this.studentID][key]['fieldScore'] =
        fieldScore * this.defaultWeights[5];
      this.runningTotal = 0;
      this.runningTotal = this.nRelevance + this.nScope + this.nCareer;
      this.runningTotal +=
        this.studentsCompanyScores[this.studentID][key]['locScore'];
      this.runningTotal +=
        this.studentsCompanyScores[this.studentID][key]['setupScore'];
      this.runningTotal +=
        this.studentsCompanyScores[this.studentID][key]['fieldScore'];

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
    console.log(this.studentsCompanyScores[this.studentID]);
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
}
