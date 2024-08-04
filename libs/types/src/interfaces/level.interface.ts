import { ILearnerProfile } from "./learner-profile.interface";

export interface ILevel {
  id: number;
  xp: number;

  //relationships
  readonly learners: ILearnerProfile[];
}
