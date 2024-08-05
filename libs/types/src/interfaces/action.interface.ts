import { ActionNameEnum } from "../enums";
import { IActivity } from "./activity.interface";
import { IBadge } from "./badge.interface";
import { IQuest } from "./quest.interface";

export interface IAction {
  id: number;
  name: ActionNameEnum;

  // Relations
  readonly quests: IQuest[];
  readonly badges: IBadge[];
  readonly activities: IActivity[];
}
