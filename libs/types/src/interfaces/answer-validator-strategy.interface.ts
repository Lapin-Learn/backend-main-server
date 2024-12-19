import { ITestAnswer } from "./test-answer.interface";

export interface IAnswerValidatorStrategy {
  validate(userResponse: string, answer: ITestAnswer): boolean | string;
  preprocess(answer: ITestAnswer): string | string[];
}
