import { IntervalTypeEnum, MissionCategoryNameEnum } from "../enums";
import { IAction } from "./action.interface";

export interface IQuest {
  id: string;
  name: string;
  description: string;
  actionId: string;
  requirements: number;
  rewards: number;
  type: IntervalTypeEnum;
  category: MissionCategoryNameEnum;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly action: IAction;
}
