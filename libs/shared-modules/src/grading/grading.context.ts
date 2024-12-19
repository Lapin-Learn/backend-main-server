import { ExactStrategy, VariantStrategy, SuggestStrategy } from "./answer-validator-strategy";
import { AnswerTypeEnum, SkillEnum } from "@app/types/enums";
import { IAnswerValidatorStrategy, IGradingStrategy } from "@app/types/interfaces";
import { ITestAnswer } from "@app/types/interfaces";
import { Injectable } from "@nestjs/common";
import { AIGradingStrategy, RangeGradingStrategy } from "./grading-strategy";

@Injectable()
export class GradingContext {
  private validatorStrategyMap: Map<AnswerTypeEnum, IAnswerValidatorStrategy>;
  private gradingStrategyMap: Map<SkillEnum, IGradingStrategy>;
  private gradingStrategy: IGradingStrategy;
  private validatorStrategy: IAnswerValidatorStrategy;

  constructor(
    private readonly exactStrategy: ExactStrategy,
    private readonly variantStrategy: VariantStrategy,
    private readonly suggestStrategy: SuggestStrategy,
    private readonly rangeGradingStrategy: RangeGradingStrategy,
    private readonly aiGradingStrategy: AIGradingStrategy
  ) {
    this.validatorStrategyMap = new Map<AnswerTypeEnum, IAnswerValidatorStrategy>([
      [AnswerTypeEnum.EXACT, this.exactStrategy],
      [AnswerTypeEnum.VARIANT, this.variantStrategy],
      [AnswerTypeEnum.SUGGEST, this.suggestStrategy],
    ]);
    this.gradingStrategyMap = new Map<SkillEnum, IGradingStrategy>([
      [SkillEnum.LISTENING, this.rangeGradingStrategy],
      [SkillEnum.READING, this.rangeGradingStrategy],
      [SkillEnum.WRITING, this.aiGradingStrategy],
      [SkillEnum.SPEAKING, this.aiGradingStrategy],
    ]);
  }

  setValidator(testAnswer: ITestAnswer) {
    const strategy = this.validatorStrategyMap.get(testAnswer.type);
    if (!strategy) {
      throw new Error("No strategy");
    }
    this.validatorStrategy = strategy;
  }

  setGradingStrategy(skill: SkillEnum) {
    this.gradingStrategy = this.gradingStrategyMap.get(skill);
    this.gradingStrategy.setRange(skill);
  }

  validate(userResponse: string, testAnswer: ITestAnswer) {
    const preprocessResponse = userResponse.trim().toLowerCase().replace(/\s+/g, " ");
    return this.validatorStrategy.validate(preprocessResponse, testAnswer);
  }

  grade(results: boolean[] | string[]) {
    return this.gradingStrategy.evaluateBandScore(results);
  }
}
