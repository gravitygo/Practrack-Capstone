import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title-icon',
  templateUrl: './title-icon.component.html',
  styleUrls: ['./title-icon.component.scss'],
})
export class TitleIconComponent {
  @Input() color = 'bg-black';
  @Input() iconName = '';
}
