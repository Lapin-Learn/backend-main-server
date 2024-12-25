import { RankEnum } from "../enums";
import { IActivity } from "./activity.interface";
import { ILessonProcess } from "./lesson-process.interface";
import { ILessonRecord } from "./lesson-record.interface";
import { ILevel } from "./level.interface";
import { IProfileBadge } from "./profile-badge.interface";
import { IProfileItem } from "./profile-item.interface";
import { IProfileMissionProgress } from "./profile-mission-progress.interface";
import { ISpeakingRoomEvaluation } from "./speaking-room-evaluations.interface";
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
  level: ILevel;
  readonly streak: IStreak;
  readonly activities: IActivity[];
  readonly profileBadges: IProfileBadge[];
  readonly profileMissionsProgress: IProfileMissionProgress[];
  readonly profileItems: IProfileItem[];
  readonly lessonRecords: ILessonRecord[];
  readonly lessonProcesses: ILessonProcess[];
  readonly speakingRoomEvaluations: ISpeakingRoomEvaluation[];
}
