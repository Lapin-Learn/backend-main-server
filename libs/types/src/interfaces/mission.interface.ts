import { MissionTypeEnum } from "../enum";
import { IQuest } from "./quest.interface";

export interface IMission {
  id: string;
  missionType: MissionTypeEnum;

  // Relations
  readonly questId: IQuest;
}
