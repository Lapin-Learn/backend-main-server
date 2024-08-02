import { RankEnum } from "../enums";
import { ILevel } from "./level.interface";
import { IStreak } from "./streak.interface";

export interface ILearnerProfile {
  id: string;
  rank: RankEnum;
  levelId: number;
  xp: number;
  carrots: number;
  streakId: number;
  createdOn: Date;
  updatedOn: Date;

  //relationships
  readonly level: ILevel;
  readonly streak: IStreak;
}
