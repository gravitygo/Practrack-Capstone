import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRegisteration } from '../model/user.model';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly url = 'http://localhost:3000/user';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  registerUser(
    userRegistration: UserRegisteration,
    term: number
  ): Observable<any> {
    return this.http.post<any>(
      `${this.url}/register?term=${term}`,
      userRegistration,
      this.httpOptions
    );
  }
}
