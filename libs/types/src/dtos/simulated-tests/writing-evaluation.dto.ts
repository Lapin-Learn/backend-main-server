import { Type } from "class-transformer";
import { ValidateNested, IsEnum } from "class-validator";
import { CriterialEvaluation } from "./genai-shared-evaluation.dto";
import { GenAIPartEnum } from "@app/types/enums";

export class WritingCriteriaDto {
  @ValidateNested()
  @Type(() => CriterialEvaluation)
  CC: CriterialEvaluation;

  @ValidateNested()
  @Type(() => CriterialEvaluation)
  LR: CriterialEvaluation;

  @ValidateNested()
  @Type(() => CriterialEvaluation)
  GRA: CriterialEvaluation;

  @ValidateNested()
  @Type(() => CriterialEvaluation)
  TR: CriterialEvaluation;

  getOverallScore() {
    const scores = [this.CC?.score || 0, this.LR?.score || 0, this.GRA?.score || 0, this.TR?.score || 0];

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg * 2) / 2; // Round to nearest 0.5
  }
}

export class WritingEvaluation {
  @IsEnum(GenAIPartEnum)
  part: GenAIPartEnum;

  @ValidateNested()
  @Type(() => WritingCriteriaDto)
  criterias: WritingCriteriaDto;
}
