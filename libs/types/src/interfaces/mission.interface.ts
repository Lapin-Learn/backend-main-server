import { IntervalTypeEnum } from "../enums";
import { IProfileMission } from "./profile-mission.interface";
import { IQuest } from "./quest.interface";

export interface IMission {
  id: string;
  types: IntervalTypeEnum;
  questId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly quest: IQuest;
  readonly profileMissions: IProfileMission[];
}
