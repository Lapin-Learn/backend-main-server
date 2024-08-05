import { IItem } from "./item.interface";
import { ILearnerProfile } from "./learner-profile.interface";

export interface IProfileItem {
  id: string;
  itemId: string;
  profileId: string;
  quantity: number;
  expOn: Date;

  // Relations
  readonly profile: ILearnerProfile;
  readonly item: IItem;
}
