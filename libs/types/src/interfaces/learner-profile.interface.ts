import { RankEnum } from "../enums";
import { IActivity } from "./activity.interface";
import { ILevel } from "./level.interface";
import { IProfileBadge } from "./profile-badge.interface";
import { IProfileItem } from "./profile-item.interface";
import { IProfileMission } from "./profile-mission.interface";
import { IStreak } from "./streak.interface";

export interface ILearnerProfile {
  id: string;
  rank: RankEnum;
  levelId: number;
  xp: number;
  carrots: number;
  streakId: number;
  createdAt: Date;
  updatedAt: Date;

  //relationships
  readonly level: ILevel;
  readonly streak: IStreak;
  readonly activities: IActivity[];
  readonly profileBadges: IProfileBadge[];
  readonly profileMissions: IProfileMission[];
  readonly profileItems: IProfileItem[];
}
