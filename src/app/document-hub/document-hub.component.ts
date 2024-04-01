import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

import {} from '@angular/fire/functions';
import { BehaviorSubject } from 'rxjs';
import { BreadcrumbService } from 'xng-breadcrumb';
import { LoadingService } from '../services/loading.service';
@Component({
  selector: 'app-document-hub',
  templateUrl: './document-hub.component.html',
  styleUrls: ['./document-hub.component.scss'],
})
export class DocumentHubComponent {
  private auth: Auth = inject(Auth);
  role: BehaviorSubject<string> = new BehaviorSubject('');

  //TODO: remove the student role
  constructor(
    private breadcrumbService: BreadcrumbService,
    private loadingService: LoadingService
  ) {
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
      this.breadcrumbService.set('@DocumentHub', {
        routeInterceptor: (routeLink, breadcrumb) =>
          `/documentHub/${(token.claims['role'] as string) ?? 'coordinator'}`,
        label: 'Document Hub',
      });
    });
  }

  ngOnInit() {}
}
