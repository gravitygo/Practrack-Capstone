import { Component, Input } from '@angular/core';
import { RemarksColor, RemarksIcon } from 'src/app/enum/deployment-color.enum';
import { RemarksStatus } from 'src/typings';

@Component({
  selector: 'app-steps-information',
  templateUrl: './steps-information.component.html',
  styleUrls: ['./steps-information.component.scss'],
})
export class StepsInformationComponent {
  @Input() showStatus!: boolean;
  @Input() documentRequirements!: {
    requirement: string;
    version: string | undefined | null;
    dueDate: Date | undefined | null;
    submittedOn: Date | undefined | null;
    status: RemarksStatus;
    documentID: number | undefined | null;
    acadTermFileId: number;
    isFileSubmission: boolean;
    requirementId: number;
  }[];
  remarksColor = RemarksColor;
  remarksIcon = RemarksIcon;
}
