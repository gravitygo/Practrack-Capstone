import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Account } from '../model/account.model';
import { Auth } from '@angular/fire/auth';
@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  readonly url = 'http://localhost:3000/document';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  private auth: Auth = inject(Auth);
  constructor(private http: HttpClient) {}

  insertFile(
    batch: number,
    phase: number,
    documentType: number,
    date?: string | null
  ): Observable<any> {
    return this.http.post<any>(
      `${this.url}/file/${batch}`,
      {
        phase: phase,
        date: date,
        document: documentType,
        createdBy: this.auth.currentUser?.uid,
      },
      this.httpOptions
    );
  }

  getDocumentList(batch: number): Observable<any> {
    return this.http.get<any>(`${this.url}/batch/${batch}`, this.httpOptions);
  }

  patchDocument(
    batch: number,
    date: string,
    ojtPhase: string
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.url}/batch/${batch}`,
      { dueDate: date, ojtPhase: ojtPhase },
      this.httpOptions
    );
  }

  patchOulcDocument(
    documentID: number,
    feedback: string,
    status: number
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.url}/oulc/${documentID}`,
      {
        feedback: feedback,
        status: status,
        currentUser: this.auth.currentUser?.uid,
      },
      this.httpOptions
    );
  }

  patchEnabled(id: number, enabled: boolean): Observable<any> {
    return this.http.patch<any>(
      `${this.url}/file/${id}`,
      { enabled: enabled },
      this.httpOptions
    );
  }

  submitDocuments(
    documentName: string,
    acadTermFileID: number
  ): Observable<any> {
    return this.http.post<any>(
      `${this.url}/document`,
      {
        documentName: documentName,
        filePath: `${this.auth.currentUser?.uid}/${acadTermFileID}`,
        fileId: acadTermFileID,
        createdBy: this.auth.currentUser?.uid,
      },
      this.httpOptions
    );
  }
  getSubmittedDocuments(): Observable<any> {
    return this.http.get<any>(
      `${this.url}/oulc/submittedDocuments`,
      this.httpOptions
    );
  }

  getSubmittedDocument(documentID: number): Observable<any> {
    return this.http.get<any>(
      `${this.url}/file/${documentID}`,
      this.httpOptions
    );
  }
  getDocumentsStudentView(acadTerm: number, ojtPhase: number): Observable<any> {
    return this.http.get<any>(
      `${this.url}/student/documents/${this.auth.currentUser?.uid}/${acadTerm}/${ojtPhase}`,
      this.httpOptions
    );
  }
  patchSubmittedDocument(documentId: number): Observable<any> {
    return this.http.patch<any>(
      `${this.url}/document`,
      {
        id: documentId,
        accountId: this.auth.currentUser?.uid,
      },
      this.httpOptions
    );
  }

  getDocument(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/document/${id}`, this.httpOptions);
  }

  getSubmittedDocumentCoordinator(
    user: string,
    ojtPhase: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.url}/document/${user}/${ojtPhase}`,
      this.httpOptions
    );
  }

  sendFeedback(
    feedback: string,
    fileStatus: number,
    documentID: number
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.url}/feedback`,
      {
        feedback: feedback,
        fileStatus: fileStatus,
        checkedBy: this.auth.currentUser?.uid,
        documentID: documentID,
      },
      this.httpOptions
    );
  }

  saveDeployment(
    userID: string,
    startDate: Date,
    endDate: Date,
    companyID: number
  ) {
    return this.http.post<any>(
      `${this.url}/save`,
      { userID, startDate, endDate, companyID },
      this.httpOptions
    );
  }
}
