import { IntervalTypeEnum } from "../enums";
import { IAction } from "./action.interface";

export interface IQuest {
  id: string;
  name: string;
  description: string;
  actionId: string;
  requirements: number;
  rewards: number;
  types: IntervalTypeEnum;

  // Relations
  readonly action: IAction;
}
