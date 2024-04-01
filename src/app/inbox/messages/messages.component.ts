import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  @ViewChild('messageViewer') private messageView!: ElementRef;
  auth = inject(Auth);
  currentUser = this.auth.currentUser!.uid;
  chat!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private inboxService: InboxService
  ) {
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
}
