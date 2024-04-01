import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent {
  loading$: Observable<boolean> = new BehaviorSubject(false);
  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
  }
}
