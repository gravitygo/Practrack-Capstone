import { Component } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-main-template',
  templateUrl: './main-template.component.html',
  styleUrls: ['./main-template.component.scss'],
})
export class MainTemplateComponent {
  ngAfterViewInit() {
    initFlowbite();
  }
}
