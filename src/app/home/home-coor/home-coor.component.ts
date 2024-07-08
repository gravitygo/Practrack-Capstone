import { Component, inject, ViewChild } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { LoadingService } from '../../services/loading.service';
import { MatPaginator } from '@angular/material/paginator';
import { TermService } from '../../services/term.service';
import { CoorTurnoverService } from 'src/app/services/coor-turnover.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-home-coor',
  templateUrl: './home-coor.component.html',
  styleUrls: ['./home-coor.component.scss'],
})
export class HomeCoorComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private auth: Auth = inject(Auth);
  userLogged = this.auth;

  termRow: any = [];
  term: number = 0;
  termVal: string = '';
  termString: string = '';

  values: number[] = [];
  rows: any[] = [];
  data: any = null;

  toggleTurnover: boolean = false;

  requestMigrate: any = [];

  constructor(
    private homeServ: HomeService,
    private router: Router,
    private loadingService: LoadingService,
    private termServ: TermService,
    private turnoverServ: CoorTurnoverService,
    private supabaseService: SupabaseService
  ) {
    this.loadingService.showLoading();
    this.turnoverServ.coorTurnoverBool().subscribe((value) => {
      this.toggleTurnover = value;
      this.loadingService.hideLoading();
    });
  }

  ngOnInit(): void {
    this.getValues();

    // LISTENER
    this.supabaseService.getNotifs().subscribe(() => {
      this.getValues();
    });
  }

  getValues() {
    try {
      this.loadingService.showLoading();

      // GET CURRENT TERM
      this.termServ.getCurrentTerm().subscribe((response) => {
        this.termRow = response;
        this.term = this.termRow.lookupID;
        this.termVal = this.termRow.value;
        this.termString = `A.Y. 20${this.termVal.slice(
          2,
          4
        )}-20${this.termVal.slice(5, 7)}, Term ${this.termVal.slice(9)}`;

        this.homeServ
          .getValues(this.userLogged.currentUser!.uid!, this.term)
          .subscribe((response) => {
            this.values = [
              response[0]!.unchecked_submissions_count,
              response[1]!.unread_messages_count,
            ];
            this.rows = response[2];
            this.paginator.length = this.rows.length;

            this.data = response[3];
            if (response[4]) this.requestMigrate = response[4];
          });
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.loadingService.hideLoading();
    }
  }

  // Calculate the indices of the rows that should be visible based on the paginator's pageIndex and pageSize
  getVisibleIndices(): number[] {
    const startIndex = this.paginator?.pageIndex * this.paginator?.pageSize;
    const endIndex = startIndex + this.paginator?.pageSize;
    return Array.from({ length: this.rows.length }, (_, index) => index).slice(
      startIndex,
      endIndex
    );
  }
}
