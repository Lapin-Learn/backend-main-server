import { IInstruction } from "./instruction.interface";
import { IQuestionToLesson } from "./question-to-lesson.interface";
import { IQuestionType } from "./question-type.interface";

export interface ILesson {
  id: number;
  name: string;
  order: number;
  questionTypeId: number;
  createdAt: Date;
  updatedAt: Date;

  readonly questionType: IQuestionType;
  readonly instructions: IInstruction[];
  readonly questionToLessons: IQuestionToLesson[];
}
