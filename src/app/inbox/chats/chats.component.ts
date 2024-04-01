import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent {
  @Input() chatList: any[] = [];
  @Output() chatEvent = new EventEmitter<any>();
  auth = inject(Auth);
  role: string = '';

  constructor() {
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role = token.claims['role'] as string;
    });
  }

  changeChat(id: string, name: string) {
    this.chatEvent.emit({ id: id, name: name });
  }
}
