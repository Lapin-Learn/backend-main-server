import { IsEnum, ValidateNested } from "class-validator";
import { CriterialEvaluation } from "./genai-shared-evaluation.dto";
import { Type } from "class-transformer";
import { GenAIPartEnum } from "@app/types/enums";

export class SpeakingCriteriaDto {
  @ValidateNested()
  @Type(() => CriterialEvaluation)
  P: CriterialEvaluation;

  @ValidateNested()
  @Type(() => CriterialEvaluation)
  LR: CriterialEvaluation;

  @ValidateNested()
  @Type(() => CriterialEvaluation)
  FC: CriterialEvaluation;

  @ValidateNested()
  @Type(() => CriterialEvaluation)
  GRA: CriterialEvaluation;

  getOverallScore() {
    const scores = [this.P?.score || 0, this.LR?.score || 0, this.GRA?.score || 0, this.FC?.score || 0];

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg * 2) / 2; // Round to nearest 0.5
  }
}

export class SpeakingEvaluation {
  @IsEnum(GenAIPartEnum)
  part: GenAIPartEnum;

  @ValidateNested()
  @Type(() => SpeakingCriteriaDto)
  criterias: SpeakingCriteriaDto;
}
