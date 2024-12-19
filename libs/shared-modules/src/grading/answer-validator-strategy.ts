import { Injectable } from "@nestjs/common";
import { ExactTestAnswer, VariantsTestAnswer, SuggestTestAnswer } from "@app/types/interfaces/test-answer.interface";
import { IAnswerValidatorStrategy } from "@app/types/interfaces";
@Injectable()
export class ExactStrategy implements IAnswerValidatorStrategy {
  validate(response: string, answer: ExactTestAnswer): boolean {
    return response === answer.valid;
  }
}

@Injectable()
export class VariantStrategy implements IAnswerValidatorStrategy {
  validate(response: string, answer: VariantsTestAnswer): boolean {
    return answer.variants.includes(response);
  }
}

@Injectable()
export class SuggetStrategy implements IAnswerValidatorStrategy {
  serviceAI(prompt: string, response: string): string {
    return `This is the prompt: ${prompt} for response: ${response}`;
  }
  validate(response: string, answer: SuggestTestAnswer): string {
    return this.serviceAI(answer.prompt, response);
  }
}
