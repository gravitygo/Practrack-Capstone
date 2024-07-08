import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Announcement } from '../model/announcement.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  readonly url = 'http://localhost:3000/announcements';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  // View All Announcements = STUDENT

  getStudentProfile(userID: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/${userID}/student`,
      this.httpOptions
    );
  }

  viewBatchAnnouncements(userID: string, batch: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/${userID}/student/${batch}`,
      this.httpOptions
    );
  }

  // View All Announcements = COOR

  viewAnnouncements(): Observable<any> {
    return this.http
      .get<any>(`${this.url}/coor`, this.httpOptions)
      .pipe(map((i) => i.announcements));
  }

  viewFilteredAnnouncements(batch: string): Observable<any> {
    return this.http
      .get<any>(`${this.url}/coor/${batch}`, this.httpOptions)
      .pipe(map((i) => i.announcements));
  }

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

  addAnnouncement(announcement: Announcement, userID: string): Observable<any> {
    return this.http.post<any>(
      `${this.url}/${userID}/add`,
      announcement,
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
