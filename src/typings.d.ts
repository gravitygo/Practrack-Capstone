import {
  DeploymentColor,
  RemarksColor,
} from './app/enum/deployment-color.enum';

// src/typings.d.ts
declare type DeploymentStage = keyof typeof DeploymentColor;
declare type RemarksStatus = keyof typeof RemarksColor;
