import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { InboxService } from 'src/app/services/inbox.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent {
  @Input() messagesList: any[] = [];
  @Input() chatName: string = '';
  @Input() chatId: string = '';
  @Input() isGroup: boolean = false;
  @Input() isRead: boolean = false;
  @Input() isActive: boolean = true;
  @ViewChild('messageViewer') private messageView!: ElementRef;
  auth = inject(Auth);
  currentUser = this.auth.currentUser!.uid;
  role: BehaviorSubject<string> = new BehaviorSubject('');
  chat!: FormGroup;
  isModalOpen = false;
  idNum = 0;
  members: string[] = [];

  constructor(
    private fb: FormBuilder,
    private inboxService: InboxService
  ) {
    this.auth.currentUser?.getIdTokenResult(true).then((token) => {
      this.role.next(token.claims['role'] as string);
    });
    this.chat = this.fb.group({
      message: ['', [Validators.required]],
    });
  }

  submitMessage() {
    if (this.chat.valid) {
      const message = this.chat.value.message;
      this.inboxService.insertMessage(message, this.chatId).subscribe();
      this.chat.reset();
    }
  }

  setRead() {
    this.inboxService
      .setRead(this.chatId, this.auth.currentUser!.uid)
      .subscribe();
  }

  getMembers() {
    this.inboxService.getMembers(this.chatId).subscribe((results) => {
      results.forEach((member: { firstName: string; lastName: string }) => {
        const fullName = member.firstName + ' ' + member.lastName;
        if (!this.members.includes(fullName)) {
          this.members.push(fullName);
        }
      });
    });
  }

  addMembers() {
    // get companyID of current chat
    this.inboxService.getChatCompany(this.chatId).subscribe((companyID) => {
      const company = companyID[0].mainID;

      // get existing members of current chat
      this.inboxService.getMembers(this.chatId).subscribe((members) => {
        const currMembers: string[] = [];
        members.forEach((member: { userID: string }) => {
          currMembers.push(member.userID);
        });

        // get all interns under the company of current chat
        this.inboxService.getInternsOfCompany(company).subscribe((interns) => {
          const currInterns: string[] = [];
          interns.forEach((intern: { userID: string }) => {
            currInterns.push(intern.userID);
          });

          // get interns not yet in chat
          const nonMembers: string[] = [];
          currInterns.forEach((intern) => {
            if (!currMembers.includes(intern)) {
              nonMembers.push(intern);
            }
          });

          // add non members to chat
          let ctr = 0;
          nonMembers.forEach((userID) => {
            this.inboxService.addMember(this.chatId, userID).subscribe();

            // set inbox to unread for new users
            this.inboxService.setRead(this.chatId, userID).subscribe();

            ctr++;
          });

          alert(ctr + ' members added to ' + this.chatName);
        });
      });
    });
  }

  ngOnInit() {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messageView.nativeElement.scrollTop =
        this.messageView.nativeElement.scrollHeight;
    } catch (err) {
      // Handle any errors if needed
    }
  }

  toggleModal(idNum: number, isModalOpen?: boolean) {
    if (isModalOpen != null) this.isModalOpen = isModalOpen;
    else this.isModalOpen = !this.isModalOpen;
    this.idNum = idNum;
    this.getMembers();
  }
}
