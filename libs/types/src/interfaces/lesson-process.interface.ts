import { ILearnerProfile } from "./learner-profile.interface";
import { ILesson } from "./lesson.interface";

export interface ILessonProcess {
  id: string;
  lessonId: string;
  learnerProfileId: string;
  correctAnswers: number;
  wrongAnswers: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly lesson: ILesson;
  readonly learnerProfile: ILearnerProfile;
}
