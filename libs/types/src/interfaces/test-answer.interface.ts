import { AnswerTypeEnum } from "../enums";

export interface ITestAnswer {
  type: AnswerTypeEnum;
}

export interface ExactTestAnswer extends ITestAnswer {
  valid: string;
}

export interface VariantTestAnswer extends ITestAnswer {
  variants: string[];
}

export interface SuggestTestAnswer extends ITestAnswer {
  prompt: string;
}
