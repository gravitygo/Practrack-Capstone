import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { CompanyListing } from '../model/companyListing.model';
import { map } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CompanyListingService {
  readonly url = 'http://localhost:3000/companylisting';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  addCompanyListing(companyListing: CompanyListing): Observable<any> {
    return this.http.post<any>(
      `${this.url}/addCompany`,
      companyListing,
      this.httpOptions
    );
  }

  // to return to companylist when viewing added companylist
  viewCompanyList(userID: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${userID}`, this.httpOptions);
  }

  viewCompanyModal(companyID: number): Observable<any> {
    return this.http.get<any>(
      `${this.url}/${companyID}/modal`,
      this.httpOptions
    );
  }

  // Return when saving edited company
  saveCompany(companyID: number, company: CompanyListing): Observable<any> {
    return this.http.post<any>(
      `${this.url}/${companyID}/save`,
      company,
      this.httpOptions
    );
  }

  deleteCompany(companyID: number, uid: string): Observable<any> {
    const params = new HttpParams().set('uid', uid);
    return this.http.delete<any>(`${this.url}/${companyID}`, {
      ...this.httpOptions,
      params,
    });
  }
}
