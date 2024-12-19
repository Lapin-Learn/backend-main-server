import {
  AnswerValidator,
  EvaluatetValidator,
  ExactValidator,
  VariantsValidator,
} from "@app/shared-modules/answer-validator/answer-validator-template";
import { AnswerTypeEnum } from "@app/types/enums";
import { TestAnswer } from "@app/types/interfaces/test-answer.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EvaluateResponseService {
  private answer: string;
  constructor(
    private readonly excactValidator: ExactValidator,
    private readonly variantValidator: VariantsValidator,
    private readonly suggestValidator: EvaluatetValidator
  ) {}

  getValidator(testAnswer: TestAnswer): AnswerValidator {
    this.answer = testAnswer.getAnswer();
    if (testAnswer.type === AnswerTypeEnum.EXCACT) {
      return this.excactValidator;
    }
  }
}
