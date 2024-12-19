import { Injectable } from "@nestjs/common";
import {
  TestAnswer,
  ExactTestAnswer,
  VariantsTestAnswer,
  SuggestTestAnswer,
} from "@app/types/interfaces/test-answer.interface";

export interface AnswerValidator {
  validate(response: string, answer: TestAnswer): boolean | string;
}

@Injectable()
export class ExactValidator implements AnswerValidator {
  validate(response: string, answer: ExactTestAnswer): boolean {
    return response === answer.valid;
  }
}

@Injectable()
export class VariantsValidator implements AnswerValidator {
  validate(response: string, answer: VariantsTestAnswer): boolean {
    return answer.variants.includes(response);
  }
}

@Injectable()
export class EvaluatetValidator implements AnswerValidator {
  serviceAI(prompt: string, response: string): string {
    return `This is the prompt: ${prompt} for response: ${response}`;
  }
  validate(response: string, answer: SuggestTestAnswer): string {
    return this.serviceAI(answer.prompt, response);
  }
}
