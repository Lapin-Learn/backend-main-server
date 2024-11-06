import { ProfileItemStatusEnum } from "../enums";
import { IItem } from "./item.interface";
import { ILearnerProfile } from "./learner-profile.interface";

export interface IProfileItem {
  id: string;
  itemId: string;
  profileId: string;
  quantity: number;
  expAt: Date;
  inUseQuantity: number;
  status: ProfileItemStatusEnum;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly profile: ILearnerProfile;
  readonly item: IItem;
}
