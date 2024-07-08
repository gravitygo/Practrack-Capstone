// Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// NPM Modules
import { NgIconsModule } from '@ng-icons/core';
import * as MaterialIconsOutline from '@ng-icons/material-icons/outline';
import * as MaterialIconsRound from '@ng-icons/material-icons/round';
import * as MaterialIconsSharp from '@ng-icons/material-icons/sharp';

import { BreadcrumbModule, BreadcrumbService } from 'xng-breadcrumb';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

// Material
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { Auth, getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from './environment/environment';
import { getStorage, provideStorage } from '@angular/fire/storage';

// Components
import { SharedModule } from './components/shared.module';
import { StepsComponent } from './document-hub/student-view/steps/steps.component';
import { StepsInformationComponent } from './document-hub/student-view/steps-information/steps-information.component';

// Sub Pages
import { RequirementsComponent } from './document-hub/coordinator-view/requirements/requirements.component';
import { StudentsComponent } from './document-hub/coordinator-view/students/students.component';
import { OulcComponent } from './document-hub/coordinator-view/oulc/oulc.component';
import { HomeCoorComponent } from './home/home-coor/home-coor.component';
import { HomeStudentComponent } from './home/home-student/home-student.component';
import { SubmissionComponent } from './document-hub/student-view/submission/submission.component';
import { SubmissionDetailedComponent } from './document-hub/student-view/submission-detailed/submission-detailed.component';
import { CoordinatorViewComponent } from './document-hub/coordinator-view/coordinator-view.component';
import { StudentDocumentsComponent } from './document-hub/coordinator-view/student-documents/student-documents.component';
import { StudentDocumentsInformationComponent } from './document-hub/coordinator-view/student-documents-information/student-documents-information.component';
import { FileViewerComponent } from './document-hub/coordinator-view/file-viewer/file-viewer.component';
import { SubmissionV2Component } from './document-hub/student-view/submission-v2/submission-v2.component';

// Schematics
import { MainTemplateComponent } from './schematics/main-template/main-template.component';
import { AuthTemplateComponent } from './schematics/auth-template/auth-template.component';

// Pages
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AnnouncementsComponent } from './announcements/announcements.component';
import { AnnouncementDetailsComponent } from './announcement-details/announcement-details.component';
import { CompanyListingComponent } from './company-listing/company-listing.component';
import { MoaDSSComponent } from './moa-dss/moa-dss.component';
import { JobMatchingComponent } from './job-matching/job-matching.component';
import { MoaDetailsComponent } from './moa-details/moa-details.component';
import { InboxComponent } from './inbox/inbox.component';
import { DocumentHubComponent } from './document-hub/document-hub.component';
import { AccountComponent } from './account/account.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DocumentViewerComponent } from './document-hub/coordinator-view/document-viewer/document-viewer.component';
import { CompanyEvaluationsComponent } from './company-evaluations/company-evaluations.component';
import { BatchComponent } from './batch/batch.component';
import { MoaConfigureComponent } from './moa-configure/moa-configure.component';
import { MoaErrorComponent } from './moa-error/moa-error.component';
import { JobMatchingDetailsComponent } from './job-matching-details/job-matching-details.component';
import { MessagesComponent } from './inbox/messages/messages.component';
import { ChatsComponent } from './inbox/chats/chats.component';
import { CriteriaRankingComponent } from './criteria-ranking/criteria-ranking.component';
import { LoginForgotComponent } from './login-forgot/login-forgot.component';
import { DtrComponent } from './document-hub/student-view/dtr/dtr.component';
import { OnboardingComponent } from './onboarding/onboarding.component';

//Calendar Import
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { FilterPipe } from './filter.pipe';
import { TrimPipe } from './pipe/trim.pipe';
import { RouteReuseStrategy, Router } from '@angular/router';
import { AlwaysRecreateStrategy } from './always-recreate-strategy';
import { RoleGuardFactory } from './role.guard';

@NgModule({
  declarations: [
    AppComponent,
    MainTemplateComponent,
    AuthTemplateComponent,
    HomeComponent,
    HomeStudentComponent,
    SignupComponent,
    LoginComponent,
    AnnouncementsComponent,
    AnnouncementDetailsComponent,
    CompanyListingComponent,
    MoaDSSComponent,
    JobMatchingComponent,
    MoaDetailsComponent,
    InboxComponent,
    AccountComponent,
    ChangePasswordComponent,
    DocumentHubComponent,
    DocumentViewerComponent,
    CompanyEvaluationsComponent,
    RequirementsComponent,
    StudentsComponent,
    OulcComponent,
    FilterPipe,
    TrimPipe,
    StepsComponent,
    StepsInformationComponent,
    SubmissionComponent,
    SubmissionDetailedComponent,
    CoordinatorViewComponent,
    StudentDocumentsComponent,
    StudentDocumentsInformationComponent,
    FileViewerComponent,
    MoaConfigureComponent,
    JobMatchingDetailsComponent,
    MoaErrorComponent,
    LoginForgotComponent,
    HomeCoorComponent,
    MessagesComponent,
    ChatsComponent,
    CriteriaRankingComponent,
    BatchComponent,
    SubmissionV2Component,
    DtrComponent,
    OnboardingComponent,
  ],
  imports: [
    BrowserModule,
    BreadcrumbModule,
    AppRoutingModule,
    ReactiveFormsModule, // Calendar
    MatDatepickerModule,
    MatTooltipModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule, //Calendar End
    MatButtonToggleModule,
    MatPaginatorModule, // Table Pagination
    SharedModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgIconsModule.withIcons({
      ...MaterialIconsOutline,
      ...MaterialIconsRound,
      ...MaterialIconsSharp,
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
    NgxExtendedPdfViewerModule,
    MatIconModule,
    MatExpansionModule,
  ],

  providers: [
    BreadcrumbService,
    MatSnackBar,
    { provide: RouteReuseStrategy, useClass: AlwaysRecreateStrategy },
    {
      provide: 'roleGuard',
      useFactory: RoleGuardFactory,
      deps: [Auth, Router],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
