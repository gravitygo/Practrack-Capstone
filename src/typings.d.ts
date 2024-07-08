import {
  DeploymentColor,
  RemarksColor,
} from './app/enum/deployment-color.enum';

import { SnackType } from './app/enum/snacktype.enum';

// src/typings.d.ts
declare type DeploymentStage = keyof typeof DeploymentColor;
declare type RemarksStatus = keyof typeof RemarksColor;
declare type SnackBarType = keyof typeof SnackType;
