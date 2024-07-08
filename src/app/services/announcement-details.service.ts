import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Announcement } from '../model/announcement.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementDetailsService {
  readonly url = 'http://localhost:3000/announcements';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  // View One Announcement

  viewAnnouncement(
    announcementID: number,
    userID: string,
    role: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.url}/${userID}/${announcementID}/view/${role}`,
      this.httpOptions
    );
  }

  // CRUD

  setRead(announcementID: number, uid: string): Observable<any> {
    return this.http.post<any>(
      `${this.url}/read/${announcementID}/${uid}`,
      this.httpOptions
    );
  }

  saveAnnouncement(
    announcementID: number,
    announcement: Announcement,
    userID: string
  ): Observable<any> {
    return this.http.post<any>(
      `${this.url}/${userID}/${announcementID}/save`,
      announcement,
      this.httpOptions
    );
  }

  deleteAnnouncement(announcementID: number, userID: string): Observable<any> {
    return this.http.delete<any>(
      `${this.url}/${userID}/${announcementID}/delete`,
      {
        ...this.httpOptions,
      }
    );
  }
}
