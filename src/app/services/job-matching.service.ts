import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobMatchingService {
  readonly url = 'http://localhost:3000/jobMatching';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getCompanySheets(): Observable<any> {
    return this.http.get<any>(`${this.url}`, this.httpOptions);
  }
}
