import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';
import { SnackBarType } from 'src/typings';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}
  public openSnackBar(
    message: string,
    action: string,
    snackType?: SnackBarType
  ) {
    const _snackType: SnackBarType =
      snackType !== undefined ? snackType : 'Success';

    this.snackBar.openFromComponent(SnackbarComponent, {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      data: { message: message, snackType: _snackType },
    });
  }
}
