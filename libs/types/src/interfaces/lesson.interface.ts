import { IQuestionToLesson } from "./question-to-lesson.interface";
import { ILessonProcess } from "./lesson-process.interface";
import { ILessonRecord } from "./lesson-record.interface";
import { IQuestionType } from "./question-type.interface";
import { BandScoreEnum } from "../enums";

export interface ILesson {
  id: number;
  name: string;
  order: number;
  questionTypeId: number;
  bandScore: BandScoreEnum;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly questionType: IQuestionType;
  readonly lessonRecords: ILessonRecord[];
  readonly questionToLessons: IQuestionToLesson[];
  readonly lessonProcesses: ILessonProcess[];
}
