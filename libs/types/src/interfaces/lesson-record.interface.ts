import { ILearnerProfile } from "./learner-profile.interface";
import { ILesson } from "./lesson.interface";

export interface ILessonRecord {
  id: string;
  lessonId: string;
  learnerProfileId: string;
  totalAnswers: number;
  correctAnswers: number;
  wrongAnswers: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly lesson: ILesson;
  readonly learnerProfile: ILearnerProfile;
}
