import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  readonly url = 'http://localhost:3000/home';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getValues(uid: string, term: number): Observable<any> {
    return this.http.get<any[]>(`${this.url}/coor`, { params: { uid, term } });
  }

  getStudentHome(uid: string): Observable<any> {
    return this.http.get<any[]>(`${this.url}/student`, { params: { uid } });
  }
}
