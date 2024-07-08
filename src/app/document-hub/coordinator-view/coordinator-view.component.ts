import { Component } from '@angular/core';
import { Tab } from 'src/app/model/tab.model';
import { BreadcrumbService } from 'xng-breadcrumb';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coordinator-view',
  templateUrl: './coordinator-view.component.html',
  styleUrls: ['./coordinator-view.component.scss'],
})
export class CoordinatorViewComponent {
  activeTab: string = 'students'; // Default active tab
  tabs: Tab[];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private activeRouter: ActivatedRoute
  ) {
    this.breadcrumbService.set('@DocumentHub', 'Document Hub');
    this.tabs = [
      {
        name: 'Students',
        icon: 'matGroups2Outline',
        iconColor: 'bg-amber-700',
        template: 'students',
      },
      {
        name: 'Requirements',
        icon: 'matPriorityHighOutline',
        iconColor: 'bg-lime-700',
        template: 'requirements',
      },
      {
        name: 'OULC',
        icon: 'matWorkspacesOutline',
        iconColor: 'bg-blue-700',
        template: 'oulc',
      },
    ];
  }

  ngOnInit() {
    var data = this.activeRouter.snapshot.queryParamMap.get('tab');
    if (data) this.activeTab = data;
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }
}
