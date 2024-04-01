import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoorTurnoverService {
  readonly url = 'http://localhost:3000/coorAccts';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  coorTurnoverBool(): Observable<any> {
    return this.http.get<any>(`${this.url}`, this.httpOptions);
  }
}
