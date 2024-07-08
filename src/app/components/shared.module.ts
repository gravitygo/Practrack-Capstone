// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal/modal.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { TitleIconComponent } from './title-icon/title-icon.component';
import { NgIconsModule } from '@ng-icons/core';
import { RouterModule } from '@angular/router';
import { LoadingComponent } from './loading/loading.component';
import { TabComponent } from './tab/tab.component';
import { HomeDonutComponent } from './home-donut/home-donut.component';
import { EvalResDonutComponent } from './eval-res-donut/eval-res-donut.component';
import { EvalGradeDonutComponent } from './eval-grade-donut/eval-grade-donut.component';
import { EvalLineComponent } from './eval-line/eval-line.component';
import { MoaBarComponent } from './moa-bar/moa-bar.component';
import { MoaRadarComponent } from './moa-radar/moa-radar.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    ModalComponent,
    NavBarComponent,
    NavItemComponent,
    TitleIconComponent,
    LoadingComponent,
    TabComponent,
    HomeDonutComponent,
    EvalResDonutComponent,
    EvalGradeDonutComponent,
    EvalLineComponent,
    MoaBarComponent,
    MoaRadarComponent,
    SnackbarComponent,
  ],
  imports: [CommonModule, NgIconsModule, RouterModule, MatIconModule],
  exports: [
    ModalComponent,
    NavBarComponent,
    NavItemComponent,
    TitleIconComponent,
    LoadingComponent,
    TabComponent,
    HomeDonutComponent,
    EvalResDonutComponent,
    EvalGradeDonutComponent,
    EvalLineComponent,
    MoaBarComponent,
    MoaRadarComponent,
    SnackbarComponent,
  ],
})
export class SharedModule {}
