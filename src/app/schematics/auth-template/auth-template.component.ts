import { Component } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-auth-template',
  templateUrl: './auth-template.component.html',
  styleUrls: ['./auth-template.component.scss'],
})
export class AuthTemplateComponent {
  ngOnInit(): void {
    initFlowbite();
  }
}
