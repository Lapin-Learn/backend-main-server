import { IAction } from "./action.interface";
import { IProfileBadge } from "./profile-badge.interface";

export interface IBadge {
  id: string;
  name: string;
  description: string;
  actionId: string;
  requirements: number;

  // Relations
  readonly action: IAction;
  readonly profileBadges: IProfileBadge[];
}
