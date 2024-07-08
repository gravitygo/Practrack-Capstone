import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Batch } from '../model/batch.model';

@Injectable({
  providedIn: 'root',
})
export class BatchService {
  readonly url = 'http://localhost:3000/batch';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getBatches(): Observable<any> {
    return this.http.get<any>(`${this.url}`, this.httpOptions);
  }

  getBatch(batchID: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${batchID}`, this.httpOptions);
  }

  saveBatch(batchID: number, batch: Batch): Observable<any> {
    return this.http.post<any>(
      `${this.url}/${batchID}`,
      batch,
      this.httpOptions
    );
  }

  computeBatch(): Observable<any> {
    return this.http.get<any>(`${this.url}/computeBatch`, this.httpOptions);
  }

  insertBatch(batch: Batch): Observable<any> {
    return this.http.post<any>(
      `${this.url}/computeBatch`,
      batch,
      this.httpOptions
    );
  }

  disableBatch(batchID: number): Observable<any> {
    return this.http.post<any>(
      `${this.url}/disableBatch/${batchID}`,
      this.httpOptions
    );
  }

  enableBatch(batchID: number): Observable<any> {
    return this.http.post<any>(
      `${this.url}/enableBatch/${batchID}`,
      this.httpOptions
    );
  }
}
