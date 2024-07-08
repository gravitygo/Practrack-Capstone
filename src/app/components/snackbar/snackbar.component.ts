import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class SnackbarComponent implements OnInit {
  colorType = 'white';

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}

  ngOnInit() {}

  get getIcon() {
    switch (this.data.snackType) {
      case 'Success': {
        this.colorType = '#84CC16';
        return 'task_alt';
      }
      case 'Error': {
        this.colorType = 'red';
        return 'error';
      }
      case 'Warn': {
        this.colorType = 'orange';
        return 'warning';
      }
      case 'Info': {
        this.colorType = '#3B82F6';
        return 'info';
      }
      default: {
        this.colorType = 'red';
        return 'error';
      }
    }
  }
}
