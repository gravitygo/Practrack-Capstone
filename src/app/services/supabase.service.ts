import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environment/environment';
import { Observable, Subject } from 'rxjs';

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

  getMessages(): Observable<any> {
    const changes = new Subject<any>();

    this.supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'practrack', table: 'Messages' },
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
        { event: 'INSERT', schema: 'practrack', table: 'Chats' },
        (payload: any) => {
          changes.next(payload);
        }
      )
      .subscribe();
    return changes.asObservable();
  }
}
