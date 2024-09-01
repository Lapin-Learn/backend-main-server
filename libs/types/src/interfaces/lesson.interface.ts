import { IQuestionType } from "./question-type.interface";

export interface ILesson {
  id: number;
  name: string;
  order: number;
  questionTypeId: number;
  createdAt: Date;
  updatedAt: Date;

  readonly questionType: IQuestionType;
}
