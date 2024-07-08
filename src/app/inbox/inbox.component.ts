import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { InboxService } from '../services/inbox.service';
import { Auth } from '@angular/fire/auth';
import { AccountService } from '../services/account.service';
import { LoadingService } from '../services/loading.service';
import { TermService } from '../services/term.service';
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxComponent {
  auth = inject(Auth);
  isModalOpen = false;
  idNum = 0;
  chats: any[] = [];
  messages!: any[];
  chatId: BehaviorSubject<string> = new BehaviorSubject('');
  chatName: BehaviorSubject<string> = new BehaviorSubject('');
  isGroup: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isRead: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isActive: BehaviorSubject<boolean> = new BehaviorSubject(true);
  newChatIsGroup: boolean = false;
  composeList: { id: string; name: string }[] = [];
  companyList: { id: number; name: string }[] = [];
  role: BehaviorSubject<string> = new BehaviorSubject('');
  batch: number = 0;
  members: string[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private inboxService: InboxService,
    private accountService: AccountService,
    private loadingService: LoadingService,
    private termService: TermService
  ) {
    this.loadingService.showLoading();

    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
      if (this.role.value == 'coordinator') {
        this.termService.getCurrentTerm().subscribe((term) => {
          this.batch = term.lookupID;
          this.inboxService
            .getCompaniesWithInterns(this.batch, this.auth.currentUser!.uid)
            .subscribe((data) => {
              this.companyList = data;
            });
        });
      }
    });

    this.renderChats();
    this.renderMessages();

    //chatroom listener
    this.supabaseService.getChat().subscribe(() => {
      this.renderChats();
      this.accountService.getUserByRole().subscribe((data) => {
        this.composeList = data;
      });
      if (this.role.value == 'coordinator') {
        this.termService.getCurrentTerm().subscribe((term) => {
          this.batch = term.lookupID;
          this.inboxService
            .getCompaniesWithInterns(this.batch, this.auth.currentUser!.uid)
            .subscribe((data) => {
              this.companyList = data;
            });
        });
      }
      this.renderMessages();
    });

    // chatmembers listener
    this.supabaseService.getMembers().subscribe((payload) => {
      if (payload.new.chatID === this.chatId.value) {
        this.isRead.next(payload.new.isRead);
      }
      this.renderChats();
      this.renderMessages();
    });

    // chatmessages listener
    this.supabaseService.getMessages().subscribe(() => {
      this.renderChats();
      this.renderMessages();
    });

    this.chatId.subscribe(() => {
      this.renderChats();
      this.renderMessages();
    });

    this.accountService.getUserByRole().subscribe((data) => {
      this.composeList = data;
      this.loadingService.hideLoading();
    });
  }

  renderChats() {
    this.inboxService.getChats().subscribe((data) => {
      this.chats = data;
      if (this.chats.length > 0 && this.chatId.value === '') {
        this.chatId.next(this.chats[0].chat_id);
        this.chatName.next(this.chats[0].chat_name);
        this.isGroup.next(this.chats[0].is_group);
        this.isRead.next(this.chats[0].is_read);
        this.isActive.next(this.chats[0].is_active);
      }
    });
  }

  createChat() {
    if (this.addForm.value.addTo == '') return;
    if (this.newChatIsGroup === false) {
      // 1-on-1 chat
      this.inboxService.createChat(false, null, null).subscribe((data) => {
        const newChatID = data[0].chatID;

        // add logged in user as member
        this.inboxService
          .addMember(newChatID, this.auth.currentUser!.uid)
          .subscribe(() => {
            // add chosen user to chat as member
            this.inboxService
              .addMember(newChatID, this.addForm.value.addTo!)
              .subscribe(() => {
                this.renderChats();
                this.toggleModal(1);
              });
          });
      });
    } else {
      // groupchat
      const companyID = this.addForm.value.addTo as unknown as number;
      this.inboxService
        .createChat(true, companyID, this.batch)
        .subscribe((data) => {
          const newChatID = data[0].chatID;

          // add logged in user as member
          this.inboxService
            .addMember(newChatID, this.auth.currentUser!.uid)
            .subscribe();

          // get all interns under company
          this.inboxService
            .getInternsOfCompany(companyID)
            .subscribe((interns) => {
              interns.forEach((intern: { userID: string }) => {
                this.members.push(intern.userID);
              });

              // add all interns as member
              this.members.forEach((member) => {
                this.inboxService.addMember(newChatID, member).subscribe();
              });

              this.renderChats();
              this.toggleModal(1);
            });
        });
    }
  }

  changeChat(val: any) {
    this.chatId.next(val.id);
    this.chatName.next(val.name);
    this.isGroup.next(val.isGroup);
    this.isRead.next(val.isRead);
    this.isActive.next(val.isActive);
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
  }

  addForm = new FormGroup({
    chatType: new FormControl(false),
    addTo: new FormControl(''),
  });

  setChatType(isGroup: boolean) {
    this.newChatIsGroup = isGroup;
  }
}
