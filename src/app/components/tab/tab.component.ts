import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tab } from 'src/app/model/tab.model';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
})
export class TabComponent {
  @Input() tabs!: Tab[];
  @Input() activeTab!: string; // Receive the active tab from the parent component
  @Output() activeTabChange = new EventEmitter<string>(); // Emit changes back to the parent component

  showTab(tabName: string): void {
    this.activeTab = tabName;
    this.activeTabChange.emit(tabName);
  }
}
