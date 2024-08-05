import { IAction } from "./action.interface";
import { ILearnerProfile } from "./learner-profile.interface";

export class IActivity {
  id: string;
  profileId: string;
  actionId: number;
  finishedAt: Date;

  // Relations
  readonly profile: ILearnerProfile;
  readonly action: IAction;
}
