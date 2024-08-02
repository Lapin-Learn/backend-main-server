import { IAction } from "./action.interface";

export interface IBadge {
  id: string;
  name: string;
  description: string;
  requirements: number;

  // Relations
  readonly actionId: IAction;
}
