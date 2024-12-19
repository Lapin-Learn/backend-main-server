import { ExactStrategy, VariantStrategy, SuggetStrategy } from "./answer-validator-strategy";
import { AnswerTypeEnum } from "@app/types/enums";
import { IAnswerValidatorStrategy } from "@app/types/interfaces";
import { ITestAnswer } from "@app/types/interfaces";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GradingContext {
  private strategyMap: Map<AnswerTypeEnum, IAnswerValidatorStrategy>;
  private validatorStrategy: IAnswerValidatorStrategy;

  constructor(
    private readonly exactStrategy: ExactStrategy,
    private readonly variantStrategy: VariantStrategy,
    private readonly suggestStrategy: SuggetStrategy
  ) {
    this.strategyMap = new Map<AnswerTypeEnum, IAnswerValidatorStrategy>([
      [AnswerTypeEnum.EXACT, this.exactStrategy],
      [AnswerTypeEnum.VARIANT, this.variantStrategy],
      [AnswerTypeEnum.SUGGEST, this.suggestStrategy],
    ]);
  }

  setValidator(testAnswer: ITestAnswer) {
    const strategy = this.strategyMap.get(testAnswer.type);
    if (!strategy) {
      throw new Error("No strategy");
    }
    this.validatorStrategy = strategy;
  }

  executeStrategy(userResponse: string, testAnswer: ITestAnswer) {
    return this.validatorStrategy.validate(userResponse, testAnswer);
  }
}
