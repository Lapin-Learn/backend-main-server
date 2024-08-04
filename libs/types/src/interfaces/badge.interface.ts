import { IAction } from "./action.interface";

export interface IBadge {
  id: string;
  name: string;
  description: string;
  actionId: string;
  requirements: number;

  // Relations
  readonly action: IAction;
}
