import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import {
  AuthGuard,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
} from '@angular/fire/auth-guard';

import { HomeComponent } from './home/home.component';
import { HomeStudentComponent } from './home/home-student/home-student.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AnnouncementsComponent } from './announcements/announcements.component';
import { AnnouncementDetailsComponent } from './announcement-details/announcement-details.component';
import { CompanyListingComponent } from './company-listing/company-listing.component';
import { MoaDSSComponent } from './moa-dss/moa-dss.component';
import { JobMatchingComponent } from './job-matching/job-matching.component';
import { JobMatchingDetailsComponent } from './job-matching-details/job-matching-details.component';
import { InboxComponent } from './inbox/inbox.component';
import { MoaDetailsComponent } from './moa-details/moa-details.component';
import { AccountComponent } from './account/account.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { CompanyEvaluationsComponent } from './company-evaluations/company-evaluations.component';
import { DocumentHubComponent } from './document-hub/document-hub.component';
import { DocumentViewerComponent } from './document-hub/coordinator-view/document-viewer/document-viewer.component';
import { MoaConfigureComponent } from './moa-configure/moa-configure.component';
import { MoaErrorComponent } from './moa-error/moa-error.component';
import { LoginForgotComponent } from './login-forgot/login-forgot.component';
import { SubmissionComponent } from './document-hub/student-view/submission/submission.component';
import { SubmissionDetailedComponent } from './document-hub/student-view/submission-detailed/submission-detailed.component';
import { StepsComponent } from './document-hub/student-view/steps/steps.component';
import { CoordinatorViewComponent } from './document-hub/coordinator-view/coordinator-view.component';
import { StudentDocumentsComponent } from './document-hub/coordinator-view/student-documents/student-documents.component';
import { FileViewerComponent } from './document-hub/coordinator-view/file-viewer/file-viewer.component';
import { CriteriaRankingComponent } from './criteria-ranking/criteria-ranking.component';
import { BatchComponent } from './batch/batch.component';
import { SubmissionV2Component } from './document-hub/student-view/submission-v2/submission-v2.component';
import { DtrComponent } from './document-hub/student-view/dtr/dtr.component';
import { OnboardingComponent } from './onboarding/onboarding.component';

const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['announcements']);
const redirectLoggedInToItems = () => redirectLoggedInTo(['home']);
const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToItems },
  },
  {
    path: 'login/forgotPassword',
    component: LoginForgotComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToItems },
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToItems },
  },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Home',
    canActivate: [AuthGuard],
    data: {
      title: 'Home',
      navLoc: 'home',
      breadcrumb: { alias: 'Home' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'home/student',
    component: HomeStudentComponent,
    title: 'Home',
    canActivate: [AuthGuard],
    data: {
      title: 'Home',
      navLoc: 'home',
      breadcrumb: { alias: 'Home' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'announcements/coor',
    component: AnnouncementsComponent,
    title: 'Announcements',
    canActivate: [AuthGuard],
    data: {
      title: 'Announcements',
      navLoc: 'announcements',
      breadcrumb: { alias: 'Announcements' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'announcements',
    component: AnnouncementsComponent,
    title: 'Announcements',
    canActivate: [AuthGuard],
    data: {
      title: 'Announcements',
      navLoc: 'announcements',
      breadcrumb: { alias: 'Announcements' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'announcements/coor/:id',
    component: AnnouncementDetailsComponent,
    title: 'Announcement Details',
    canActivate: [AuthGuard],
    data: {
      title: 'Announcement Details',
      navLoc: 'announcements',
      breadcrumb: { alias: 'Announcement Details' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'announcements/:id',
    component: AnnouncementDetailsComponent,
    title: 'Announcement Details',
    canActivate: [AuthGuard],
    data: {
      title: 'Announcement Details',
      navLoc: 'announcements',
      breadcrumb: { alias: 'Announcement Details' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'companylisting',
    component: CompanyListingComponent,
    title: 'Company Listing',
    canActivate: [AuthGuard],
    data: {
      title: 'Company Listing',
      navLoc: 'companylisting',
      breadcrumb: { alias: 'Company Listing' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'moaDSS/:id',
    component: MoaDSSComponent,
    title: 'MOA DSS',
    canActivate: ['roleGuard'],
    data: {
      title: 'MOA DSS',
      navLoc: 'moaDSS',
      breadcrumb: { alias: 'MOA DSS' },
      expectedRole: 'coordinator',
    },
  },
  {
    path: 'moaDSS/:id/companyDetails/:company',
    component: MoaDetailsComponent,
    title: 'MOA Details',
    canActivate: ['roleGuard'],
    data: {
      title: 'MOA Details',
      navLoc: 'moaDetails',
      breadcrumb: { alias: 'MOA Details' },
      expectedRole: 'coordinator',
    },
  },
  {
    path: 'moaDSS/:id/check',
    component: MoaConfigureComponent,
    title: 'MOA DSS Configure',
    canActivate: ['roleGuard'],
    data: {
      title: 'MOA DSS Configure',
      navLoc: 'moaDSSConfigure',
      breadcrumb: { alias: 'MOA Configure' },
      expectedRole: 'coordinator',
    },
  },
  {
    path: 'moaDSS/:id/error',
    component: MoaErrorComponent,
    title: 'MOA DSS Error',
    canActivate: [AuthGuard],
    data: {
      title: 'MOA DSS Error',
      navLoc: 'moaDSSError',
      breadcrumb: { alias: 'MOA Error' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'jobMatching',
    component: JobMatchingComponent,
    title: 'Job Matching',
    canActivate: ['roleGuard'],
    data: {
      title: 'Job Matching',
      navLoc: 'jobMatching',
      breadcrumb: { alias: 'Job Matching' },
      expectedRole: 'coordinator',
    },
  },
  {
    path: 'jobMatching/details',
    component: JobMatchingDetailsComponent,
    title: 'Job Matching Details',
    canActivate: [AuthGuard],
    data: {
      title: 'Job Matching Details',
      navLoc: 'jobMatchingDetails',
      breadcrumb: { alias: 'Job Matching Details' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'criteriaRanking/:id',
    component: CriteriaRankingComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Criteria Ranking',
      navLoc: 'criteriaRanking',
      breadcrumb: { alias: 'Criteria Ranking' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'inbox',
    component: InboxComponent,
    title: 'Inbox',
    canActivate: [AuthGuard],
    data: {
      title: 'Inbox',
      navLoc: 'inbox',
      breadcrumb: { alias: 'Inbox' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'account/:id',
    component: AccountComponent,
    title: 'Settings',
    canActivate: [AuthGuard],
    data: {
      title: 'Settings',
      navLoc: 'account',
      breadcrumb: { alias: 'Account' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'account/:id/resetPassword',
    component: ChangePasswordComponent,
    title: 'Reset Password',
    canActivate: [AuthGuard],
    data: {
      title: 'Reset Password',
      navLoc: 'resetPassword',
      breadcrumb: { alias: 'Reset Password' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'companyEvaluations',
    component: CompanyEvaluationsComponent,
    title: 'Company Evaluations',
    canActivate: ['roleGuard'],
    data: {
      title: 'Company Evaluation',
      navLoc: 'companyEvaluations',
      breadcrumb: { alias: 'Company Evaluation' },
      expectedRole: 'coordinator',
    },
  },
  {
    path: 'documentHub',
    component: DocumentHubComponent,
    title: 'DocumentHub',
    canActivate: [AuthGuard],
    data: {
      title: 'DocumentHub',
      navLoc: 'documentHub',
      breadcrumb: { alias: 'DocumentHub', label: 'Document Hub' },
      authGuardPipe: redirectUnauthorizedToLogin,
    },
    children: [
      {
        path: 'student',
        component: StepsComponent,
        canActivate: ['roleGuard'],
        data: {
          breadcrumb: {
            alias: 'documentStudent',
            label: 'Student',
          },
          expectedRole: 'student',
        },
      },
      {
        path: 'coordinator',
        component: CoordinatorViewComponent,
        canActivate: ['roleGuard'],
        data: {
          breadcrumb: {
            alias: 'documentCoordinator',
            label: 'Coordinator',
          },
          expectedRole: 'coordinator',
          tab: 'students',
        },
      },
      {
        path: 'coordinator/:id',
        component: FileViewerComponent,
        canActivate: ['roleGuard'],
        data: {
          breadcrumb: {
            alias: 'coordinatorStudentFileViewer',
          },
          expectedRole: 'coordinator',
        },
        children: [
          {
            path: '',
            canActivate: ['roleGuard'],
            component: StudentDocumentsComponent,
            data: {
              breadcrumb: {
                alias: 'studentFileExplorer',
              },
              expectedRole: 'coordinator',
            },
          },
          {
            path: ':acadTermId/:name',
            canActivate: ['roleGuard'],
            component: DocumentViewerComponent,
            data: {
              breadcrumb: {
                alias: 'viewDocumentForCoordinator',
              },
              expectedRole: 'coordinator',
            },
          },
        ],
      },
      {
        path: 'dtr/:id',
        canActivate: ['roleGuard'],
        component: DtrComponent,
        data: {
          breadcrumb: {
            alias: 'dtrSubmit',
            label: 'Submit',
          },
          expectedRole: 'student',
        },
      },
      {
        path: 'submit/:id/:atfl',
        canActivate: ['roleGuard'],
        component: SubmissionV2Component,
        data: {
          breadcrumb: {
            alias: 'documentHubSubmit',
            label: 'Submit',
          },
          expectedRole: 'student',
        },
      },
      {
        path: 'resubmit/:id',
        canActivate: ['roleGuard'],
        component: SubmissionDetailedComponent,
        data: {
          breadcrumb: {
            alias: 'documentHubResubmit',
            label: 'Resubmit',
          },
          expectedRole: 'student',
        },
      },
    ],
  },
  {
    path: 'batch',
    component: BatchComponent,
    title: 'Batch',
    canActivate: ['roleGuard'],
    data: {
      title: 'Batch',
      navLoc: 'batch',
      breadcrumb: { alias: 'Batch' },
      expectedRole: 'coordinator',
    },
  },
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [AuthGuard],
    title: 'Onboarding',
    data: {
      title: 'Onboarding',
      navLoc: 'onboarding',
    },
  },
];
const settings: ExtraOptions = {
  // enableTracing: true,
};
@NgModule({
  imports: [RouterModule.forRoot(routes, settings)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
