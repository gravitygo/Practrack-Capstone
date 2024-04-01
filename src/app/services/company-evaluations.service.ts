import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyEvalService {
  readonly url = 'http://localhost:3000/companyEvaluations';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getCompanyEvalsData(term: number): Observable<any> {
    return this.http.get<any[]>(`${this.url}`, { params: { term } });
  }
}
