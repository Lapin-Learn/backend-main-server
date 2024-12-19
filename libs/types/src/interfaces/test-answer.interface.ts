import { AnswerTypeEnum } from "../enums";

export interface TestAnswer {
  type: AnswerTypeEnum;
  getAnswer(): string | string;
}

export class ExactTestAnswer implements TestAnswer {
  type = AnswerTypeEnum.EXCACT;
  valid: string;

  getAnswer(): string {
    return this.valid;
  }
}

export interface VariantsTestAnswer extends TestAnswer {
  variants: string[];

  getAnswer();
}

export interface SuggestTestAnswer extends TestAnswer {
  prompt: string;
}
