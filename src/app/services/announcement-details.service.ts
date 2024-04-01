import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Announcement } from '../model/announcement.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementDetailsService {
  readonly url = 'http://localhost:3000/announcements/announcementDetails';
  readonly url2 = 'http://localhost:3000/announcements';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  viewAnnouncement(announcementID: number): Observable<any> {
    return this.http.get<any>(
      `${this.url}/${announcementID}`,
      this.httpOptions
    );
  }

  viewAnnouncementStudent(
    announcementID: number,
    userID: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.url2}/${userID}/announcementDetails/${announcementID}`,
      this.httpOptions
    );
  }

  saveAnnouncement(
    announcementID: number,
    announcement: Announcement
  ): Observable<any> {
    return this.http.post<any>(
      `${this.url}/${announcementID}/save`,
      announcement,
      this.httpOptions
    );
  }

  deleteAnnouncement(announcementID: number, uid: string): Observable<any> {
    const params = new HttpParams().set('uid', uid);
    return this.http.delete<any>(`${this.url}/${announcementID}`, {
      ...this.httpOptions,
      params,
    });
  }
}
