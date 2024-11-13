import { BandScoreEnum } from "../enums";
import { ILearnerProfile } from "./learner-profile.interface";
import { ILesson } from "./lesson.interface";
import { IQuestionType } from "./question-type.interface";
import { IXPLessonProcess } from "./xp-lesson-process.interface";

export interface ILessonProcess {
  id: string;
  learnerProfileId: string;
  questionTypeId: number;
  currentLessonId: number;
  bandScore: BandScoreEnum;
  xp: IXPLessonProcess[];
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly learnerProfile: ILearnerProfile;
  readonly questionType: IQuestionType;
  readonly currentLesson: ILesson;
}
