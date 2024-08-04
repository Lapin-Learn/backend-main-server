import { IntervalTypeEnum } from "../enums";
import { IQuest } from "./quest.interface";

export interface IMission {
  id: string;
  types: IntervalTypeEnum;
  questId: string;

  // Relations
  readonly quest: IQuest;
}
