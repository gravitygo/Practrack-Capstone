import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, from, switchMap } from 'rxjs';
import { Account } from '../model/account.model';
import { Auth, User } from '@angular/fire/auth';
import { CoordinatorRegistration } from '../model/coordinator.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  readonly url = 'http://localhost:3000/account';
  private auth: Auth = inject(Auth);

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  viewAccount(userID: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${userID}`, this.httpOptions);
  }

  viewAccountCoor(userID: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${userID}/coor`, this.httpOptions);
  }

  updateAccount(userID: string, account: Account) {
    return this.http.post<any>(
      `${this.url}/${userID}`,
      account,
      this.httpOptions
    );
  }

  getEmail(userID: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/${userID}/resetPassword`,
      this.httpOptions
    );
  }

  getRole(): Observable<any> {
    return this.http.get<any>(
      `${this.url}/getRole/${this.auth.currentUser?.uid}`,
      this.httpOptions
    );
  }

  getUsersWithPhase(): Observable<any> {
    return this.http.get<any>(`${this.url}/userWithPhase`, this.httpOptions);
  }

  getCurrentUsersWithPhase(userID?: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/userWithPhase/${userID ?? this.auth.currentUser?.uid}`,
      this.httpOptions
    );
  }

  setStudent(uid: string): Observable<any> {
    return this.http.patch<any>(`${this.url}/claim/${uid}`, this.httpOptions);
  }

  createCoordinator(
    userID: string,
    coordinator: CoordinatorRegistration
  ): Observable<any> {
    return this.http.post<any>(
      `${this.url}/${userID}/coor/turnover`,
      coordinator,
      this.httpOptions
    );
  }
  turnoverCoordinator(
    userID: string,
    coordinator: CoordinatorRegistration
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.url}/${userID}/coor/turnover`,
      coordinator,
      this.httpOptions
    );
  }

  deleteAccount(user: User): Observable<any> {
    return this.http.post<any>(
      `${this.url}/coor/deactivate`,
      { user },
      this.httpOptions
    );
  }

  getUserByRole(): Observable<any> {
    if (this.auth.currentUser !== null) {
      return from(this.auth.currentUser.getIdTokenResult(true)).pipe(
        switchMap((token) => {
          return this.http.get<any>(
            `${this.url}/users/roled/${this.auth.currentUser?.uid}/${token.claims['role']}`,
            this.httpOptions
          );
        })
      );
    }
    return EMPTY;
  }
}
