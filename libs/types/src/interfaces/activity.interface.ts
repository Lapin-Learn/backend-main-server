import { IAction } from "./action.interface";
import { ILearnerProfile } from "./learner-profile.interface";

export class IActivity {
  id: string;
  profileId: string;
  actionId: number;
  finishedOn: Date;

  // Relations
  readonly profile: ILearnerProfile;
  readonly action: IAction;
}
