import { IQuestion } from "./question.interface";

export interface IListQuestion {
  questions: IQuestion[];
  offset: number;
  limit: number;
  total: number;
}
