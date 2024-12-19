import { Injectable } from "@nestjs/common";
import { ExactTestAnswer, VariantTestAnswer, SuggestTestAnswer } from "@app/types/interfaces/test-answer.interface";
import { IAnswerValidatorStrategy } from "@app/types/interfaces";
@Injectable()
export class ExactStrategy implements IAnswerValidatorStrategy {
  validate(response: string, answer: ExactTestAnswer): boolean {
    return response === this.preprocess(answer);
  }

  preprocess(answer: ExactTestAnswer): string {
    return answer.valid.toLowerCase().trim().replace(/\s+/g, " ");
  }
}

@Injectable()
export class VariantStrategy implements IAnswerValidatorStrategy {
  validate(response: string, answer: VariantTestAnswer): boolean {
    return this.preprocess(answer).includes(response);
  }

  preprocess(answer: VariantTestAnswer): string[] {
    return answer.variants.map((variant) => variant.toLowerCase().trim().replace(/\s+/g, " "));
  }
}

@Injectable()
export class SuggestStrategy implements IAnswerValidatorStrategy {
  serviceAI(prompt: string, response: string): string {
    return `This is the prompt: ${prompt} for response: ${response}`;
  }
  validate(response: string, answer: SuggestTestAnswer): string {
    return this.serviceAI(answer.prompt, response);
  }

  preprocess(answer: SuggestTestAnswer): string | string[] {
    return answer.type;
  }
}
