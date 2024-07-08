import { Component, Input } from '@angular/core';
import { RemarksColor, RemarksIcon } from 'src/app/enum/deployment-color.enum';
import { RemarksStatus } from 'src/typings';

@Component({
  selector: 'app-student-documents-information',
  templateUrl: './student-documents-information.component.html',
  styleUrls: ['./student-documents-information.component.scss'],
})
export class StudentDocumentsInformationComponent {
  @Input() documentRequirements!: {
    requirement: string;
    version: string | undefined | null;
    dueDate: Date | undefined | null;
    submittedOn: Date | undefined | null;
    status: RemarksStatus;
    documentID: number | undefined | null;
    acadTermFileID: number;
    isFileSubmission: boolean;
    Requirement: string | undefined | null;
  }[];
  remarksColor = RemarksColor;
  remarksIcon = RemarksIcon;
}
