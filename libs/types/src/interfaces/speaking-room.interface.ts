import { ILearnerProfile } from "./learner-profile.interface";

export interface ISpeakingRoom {
  id: string;
  profileId: string;
  content: object;
  evaluation: object;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly profile: ILearnerProfile;
}
