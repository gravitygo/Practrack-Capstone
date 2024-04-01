import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TermService {
  readonly url = 'http://localhost:3000/term';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getCurrentTerm(): Observable<any> {
    return this.http.get<any>(`${this.url}`, this.httpOptions);
  }
}
