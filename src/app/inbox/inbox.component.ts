import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { InboxService } from '../services/inbox.service';
import { Auth } from '@angular/fire/auth';
import { AccountService } from '../services/account.service';
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxComponent {
  auth = inject(Auth);
  isModalOpen = false;
  idNum = 0;
  chats!: any[];
  messages!: any[];
  chatId: BehaviorSubject<string> = new BehaviorSubject('');
  chatName: BehaviorSubject<string> = new BehaviorSubject('');
  composeList: { userID: string; fullName: string }[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private inboxService: InboxService,
    private accountService: AccountService
  ) {
    this.renderChats();
    this.supabaseService.getChat().subscribe((data) => {
      this.renderChats();
      this.accountService.getUserByRole().subscribe((data) => {
        this.composeList = data;
      });
    });
    this.supabaseService.getMessages().subscribe((data) => {
      this.renderChats();
      this.renderMessages();
    });
    this.chatId.subscribe((id) => {
      this.renderChats();
      this.renderMessages();
    });

    this.accountService.getUserByRole().subscribe((data) => {
      this.composeList = data;
    });
  }

  renderChats() {
    this.inboxService.getChats().subscribe((data) => {
      console.log(data);
      this.chats = data;
      if (this.chats.length > 0 && this.chatId.value === '') {
        this.chatId.next(this.chats[0].chat_id);
        this.chatName.next(
          this.chats[0].student == this.auth.currentUser?.uid
            ? this.chats[0].coordinator_name
            : this.chats[0].student_name
        );
      }
    });
  }

  //create form group
  createChat() {
    if (this.addForm.value.addTo === '') return;
    console.log('helloooo');
    this.inboxService
      .createChat(this.addForm.value.addTo!)
      .subscribe((data) => {
        this.renderChats();
        this.toggleModal(1);
      });
  }
  changeChat(val: any) {
    this.chatId.next(val.id);
    this.chatName.next(val.name);
  }

  renderMessages() {
    if (!this.chatId.value) return;
    this.inboxService.getMessages(this.chatId.value).subscribe((data) => {
      this.messages = data;
    });
  }

  toggleModal(idNum: number, isModalOpen?: boolean) {
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;
    console.log(this.isModalOpen);
    console.log(this.idNum);
  }

  addForm = new FormGroup({
    addTo: new FormControl(''),
  });
}
