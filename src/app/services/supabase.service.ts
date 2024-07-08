import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environment/environment';
import { merge, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  supabase!: SupabaseClient;
  constructor() {
    this.supabase = createClient(
      environment.supabase.supabaseUrl,
      environment.supabase.supabaseKey
    );
  }

  // INBOX

  getMessages(): Observable<any> {
    const changes = new Subject<any>();

    this.supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'practrack', table: 'ChatMessages' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();
    return changes.asObservable();
  }

  getChat(): Observable<any> {
    const changes = new Subject<any>();

    this.supabase
      .channel('chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'practrack', table: 'ChatRooms' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();
    return changes.asObservable();
  }

  getMembers(): Observable<any> {
    const changes = new Subject<any>();

    this.supabase
      .channel('members')
      .on(
        'postgres_changes',
        { event: '*', schema: 'practrack', table: 'ChatMembers' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();

    return changes.asObservable();
  }

  // ANNOUNCEMENTS

  getAnnouncements(): Observable<any> {
    const changes = new Subject<any>();

    this.supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'practrack', table: 'Announcements' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();
    return changes.asObservable();
  }

  getAnnouncementsRead(): Observable<any> {
    const changes = new Subject<any>();

    this.supabase
      .channel('announcements_read')
      .on(
        'postgres_changes',
        { event: '*', schema: 'practrack', table: 'AnnouncementsRead' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();
    return changes.asObservable();
  }

  // DOCUMENTS

  getDocuHub(): Observable<any> {
    const changes = new Subject<any>();

    this.supabase
      .channel('hub_documents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'practrack', table: 'Documents' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();

    this.supabase
      .channel('hub_atfl')
      .on(
        'postgres_changes',
        { event: '*', schema: 'practrack', table: 'AcadTermFileList' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();

    this.supabase
      .channel('hub_students')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'practrack', table: 'Students' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();

    this.supabase
      .channel('hub_lookup')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'practrack', table: 'Lookup' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();

    return changes.asObservable();
  }

  // NOTIFS

  getNotifs(): Observable<any> {
    const inboxChanges = new Subject<any>();
    const announcementsChanges = new Subject<any>();
    const docsChanges = new Subject<any>();

    // Inbox
    this.supabase
      .channel('notifs_inbox')
      .on(
        'postgres_changes',
        { event: '*', schema: 'practrack', table: 'ChatMembers' },
        (payload: any) => {
          inboxChanges.next(payload);
        }
      )
      .subscribe();

    // Announcements
    this.supabase
      .channel('notifs_announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'practrack', table: 'AnnouncementsRead' },
        (payload: any) => {
          announcementsChanges.next(payload);
        }
      )
      .subscribe();

    // Documents
    this.supabase
      .channel('notifs_documents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'practrack', table: 'Documents' },
        (payload: any) => {
          docsChanges.next(payload);
        }
      )
      .subscribe();

    this.supabase
      .channel('notifs_atfl')
      .on(
        'postgres_changes',
        { event: '*', schema: 'practrack', table: 'AcadTermFileList' },
        (payload: any) => {
          docsChanges.next(payload);
        }
      )
      .subscribe();

    this.supabase
      .channel('notifs_students')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'practrack', table: 'Students' },
        (payload: any) => {
          docsChanges.next(payload);
        }
      )
      .subscribe();

    this.supabase
      .channel('notifs_lookup')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'practrack', table: 'Lookup' },
        (payload: any) => {
          docsChanges.next(payload);
        }
      )
      .subscribe();

    // merge streams
    return merge(
      inboxChanges.asObservable(),
      announcementsChanges.asObservable(),
      docsChanges.asObservable()
    );
  }

  // COMPANY LIST

  getCompanies(): Observable<any> {
    const changes = new Subject<any>();

    this.supabase
      .channel('company_list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'practrack', table: 'CompanyList' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();
    return changes.asObservable();
  }
}
