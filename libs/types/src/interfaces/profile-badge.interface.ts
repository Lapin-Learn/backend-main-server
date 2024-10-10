import { IBadge } from "./badge.interface";
import { ILearnerProfile } from "./learner-profile.interface";

export interface IProfileBadge {
  id: string;
  profileId: string;
  badgeId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly profile: ILearnerProfile;
  readonly badge: IBadge;
}
