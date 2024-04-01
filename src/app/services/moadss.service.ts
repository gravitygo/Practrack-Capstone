import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MoaDSS } from '../model/moadss.model';
import { MoaConfig } from '../model/moaConfig.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MoadssService {
  readonly url = 'http://localhost:3000/moaDSS';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  viewMOA(coorID: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${coorID}`, this.httpOptions);
  }

  getCompanies(coorID: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${coorID}/list`, this.httpOptions);
  }

  getRow(coorID: string, company: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/${coorID}/companyDetails/${company}`,
      this.httpOptions
    );
  }

  checkConfig(coorID: string, config: MoaConfig): Observable<any> {
    return this.http.post<any>(
      `${this.url}/${coorID}/check`,
      config,
      this.httpOptions
    );
  }
  
  saveConfig(coorID: string, config: MoaConfig): Observable<any> {
    return this.http.post<any>(
      `${this.url}/${coorID}/check/true`,
      config,
      this.httpOptions
    );
  }
}
