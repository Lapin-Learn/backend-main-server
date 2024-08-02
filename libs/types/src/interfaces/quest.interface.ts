import { IAction } from "./action.interface";

export interface IQuest {
  id: string;
  name: string;
  description: string;
  requirements: number;
  rewards: number;

  // Relations
  readonly actionId: IAction;
}
