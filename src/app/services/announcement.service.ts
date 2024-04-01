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

  addAnnouncement(announcement: Announcement, userID: string): Observable<any> {
    return this.http.post<any>(
      `${this.url}/${userID}/coor/addAnnouncement`,
      announcement,
      this.httpOptions
    );
  }

  viewAnnouncements(userID: string): Observable<any> {
    return this.http
      .get<any>(`${this.url}/${userID}/coor`, this.httpOptions)
      .pipe(map((i) => i.announcements));
  }

  viewFilteredAnnouncements(userID: string, batch: string): Observable<any> {
    return this.http
      .get<any>(`${this.url}/${userID}/coor/${batch}`, this.httpOptions)
      .pipe(map((i) => i.announcements));
  }

  viewBatchAnnouncements(userID: string, batch: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/${userID}/${batch}`,
      this.httpOptions
    );
  }

  getStudentProfile(userID: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${userID}`, this.httpOptions);
  }

  viewAnnouncement(announcementID: number, userID: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/${userID}/coor/${announcementID}/view`,
      this.httpOptions
    );
  }

  saveAnnouncement(
    announcementID: number,
    announcement: Announcement,
    userID: string
  ): Observable<any> {
    return this.http.post<any>(
      `${this.url}/${userID}/coor/${announcementID}/save`,
      announcement,
      this.httpOptions
    );
  }

  deleteAnnouncement(announcementID: number, uid: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${uid}/coor/${announcementID}`, {
      ...this.httpOptions,
    });
  }
}
