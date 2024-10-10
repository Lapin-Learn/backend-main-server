import { ProfileMissionStatusEnum } from "../enums";
import { ILearnerProfile } from "./learner-profile.interface";
import { IMission } from "./mission.interface";

export interface IProfileMission {
  id: string;
  profileId: string;
  missionId: string;
  status: ProfileMissionStatusEnum;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly profile: ILearnerProfile;
  readonly mission: IMission;
}
