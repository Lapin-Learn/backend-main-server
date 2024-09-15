import { ILearnerProfile } from "./learner-profile.interface";
import { ILesson } from "./lesson.interface";

export interface ILessonRecord {
  id: string;
  lessonId: number;
  learnerProfileId: string;
  correctAnswers: number;
  wrongAnswers: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly lesson: ILesson;
  readonly learnerProfile: ILearnerProfile;
}
