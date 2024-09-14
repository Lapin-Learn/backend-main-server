import { BandScoreEnum } from "../enums";
import { ILearnerProfile } from "./learner-profile.interface";
import { ILesson } from "./lesson.interface";
import { IQuestionType } from "./question-type.interface";

export interface ILessonProcess {
  id: string;
  learnerProfileId: string;
  questionTypeId: number;
  currentLessonId: number;
  band_score: BandScoreEnum;
  xp: object;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  learnerProfile: ILearnerProfile;
  questionType: IQuestionType;
  currentLesson: ILesson;
}
