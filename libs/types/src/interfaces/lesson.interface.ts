import { IInstruction } from "./instruction.interface";
import { IQuestionToLesson } from "./question-to-lesson.interface";
import { ILessonProcess } from "./lesson-process.interface";
import { ILessonRecord } from "./lesson-record.interface";
import { IQuestionType } from "./question-type.interface";

export interface ILesson {
  id: number;
  name: string;
  order: number;
  questionTypeId: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly questionType: IQuestionType;
  readonly lessonRecords: ILessonRecord[];
  readonly instructions: IInstruction[];
  readonly questionToLessons: IQuestionToLesson[];
  readonly lessonProcesses: ILessonProcess[];
}
