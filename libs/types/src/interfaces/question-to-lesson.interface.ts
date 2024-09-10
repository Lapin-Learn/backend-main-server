import { ILesson } from "./lesson.interface";
import { IQuestion } from "./question.interface";

export interface IQuestionToLesson {
  id: string;
  questionId: string;
  lessonId: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;

  readonly question: IQuestion;
  readonly lesson: ILesson;
}
