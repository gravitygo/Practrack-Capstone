import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { EMPTY, Observable, from, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InboxService {
  auth = inject(Auth);
  readonly url = 'http://localhost:3000/inbox';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getChats(): Observable<any> {
    if (this.auth.currentUser !== null) {
      return from(this.auth.currentUser.getIdTokenResult(true)).pipe(
        switchMap((token) => {
          return this.http.get<any>(
            `${this.url}/chats/${this.auth.currentUser!.uid}`,
            this.httpOptions
          );
        })
      );
    }
    return EMPTY;
  }

  getMessages(currentChat: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/chatmsgs/${currentChat}`,
      this.httpOptions
    );
  }

  insertMessage(message: string, currentChat: string): Observable<any> {
    const uid = this.auth.currentUser?.uid;
    return this.http.post<any>(
      `${this.url}/chats/${currentChat}/${uid}`,
      { message: message },
      this.httpOptions
    );
  }

  setRead(currentChat: string, uid: string): Observable<any> {
    return this.http.post<any>(
      `${this.url}/read/${currentChat}/${uid}`,
      this.httpOptions
    );
  }

  createChat(
    isGroup: boolean,
    mainID: number | null,
    batch: number | null
  ): Observable<any> {
    if (this.auth.currentUser !== null) {
      return from(this.auth.currentUser.getIdTokenResult(true)).pipe(
        switchMap((token) => {
          return this.http.post<any>(
            `${this.url}/chat`,
            { isGroup: isGroup, mainId: mainID, batch: batch },
            this.httpOptions
          );
        })
      );
    }
    return EMPTY;
  }

  addMember(chatID: string, userID: string): Observable<any> {
    return this.http.post<any>(
      `${this.url}/member`,
      { chatId: chatID, userId: userID },
      this.httpOptions
    );
  }

  getMembers(currentChat: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/members/${currentChat}`,
      this.httpOptions
    );
  }

  getChatCompany(currentChat: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/company/${currentChat}`,
      this.httpOptions
    );
  }

  getCompaniesWithInterns(batch: number, uid: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/companies/${batch}/${uid}`,
      this.httpOptions
    );
  }

  getInternsOfCompany(companyID: number): Observable<any> {
    return this.http.get<any>(
      `${this.url}/interns/${companyID}`,
      this.httpOptions
    );
  }

  /*
  createChat(userID: string): Observable<any> {
    if (this.auth.currentUser !== null) {
      return from(this.auth.currentUser.getIdTokenResult(true)).pipe(
        switchMap((token) => {
          if (token.claims['role'] === 'student') {
            return this.http.post<any>(
              `${this.url}/chat`,
              { coordinatorId: userID, studentId: this.auth.currentUser!.uid },
              this.httpOptions
            );
          }
          return this.http.post<any>(
            `${this.url}/chat`,
            { coordinatorId: this.auth.currentUser!.uid, studentId: userID },
            this.httpOptions
          );
        })
      );
    }
    return EMPTY;
  }
*/
}
