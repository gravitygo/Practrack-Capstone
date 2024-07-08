import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
@Component({
  selector: 'app-moa-error',
  templateUrl: './moa-error.component.html',
  styleUrls: ['./moa-error.component.scss'],
})
export class MoaErrorComponent {
  constructor(public router: Router) {}
  consistencyRatio: any;

  ngOnInit() {
    const currentState = this.router.lastSuccessfulNavigation;
    this.consistencyRatio = currentState?.extras?.state?.['cr'];
  }
}
