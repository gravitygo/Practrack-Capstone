import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KeyValue } from '../model/manifest.model';

@Injectable({
  providedIn: 'root',
})
export class ManifestService {
  readonly url = 'http://localhost:3000/manifest';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getOptions(type: string): Observable<KeyValue[]> {
    return this.http.get<KeyValue[]>(
      `${this.url}/options/${type}`,
      this.httpOptions
    );
  }
  getById(id: number): Observable<KeyValue> {
    return this.http.get<KeyValue>(
      `${this.url}/options/lookup/${id}`,
      this.httpOptions
    );
  }
  addNewLookup(name: string, type: string): Observable<any> {
    return this.http.post<any>(
      `${this.url}/options/${type}`,
      { name: name },
      this.httpOptions
    );
  }
}
