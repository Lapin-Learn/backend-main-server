import { ProfileMissionProgressStatusEnum } from "../enums";
import { ILearnerProfile } from "./learner-profile.interface";
import { IMission } from "./mission.interface";

export interface IProfileMissionProgress {
  id: string;
  profileId: string;
  missionId: string;
  status: ProfileMissionProgressStatusEnum;
  current: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly profile: ILearnerProfile;
  readonly mission: IMission;
}
