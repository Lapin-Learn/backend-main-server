import { Type } from "class-transformer";
import { ValidateNested, IsEnum, IsNumber, Min, Max, IsString, IsArray } from "class-validator";
import { GenAIPartEnum } from "@app/types/enums";

class ErrorDetail {
  @IsString()
  error: string;

  @IsString()
  correction: string;

  @IsString()
  explanation: string;

  @IsArray()
  @IsString({ each: true })
  highlight: string[];
}

class WritingCriterialEvaluation {
  @IsNumber()
  @Min(0)
  @Max(9)
  score: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ErrorDetail)
  evaluate: ErrorDetail[];
}

export class WritingCriteriaDto {
  @ValidateNested()
  @Type(() => WritingCriterialEvaluation)
  CC: WritingCriterialEvaluation;

  @ValidateNested()
  @Type(() => WritingCriterialEvaluation)
  LR: WritingCriterialEvaluation;

  @ValidateNested()
  @Type(() => WritingCriterialEvaluation)
  GRA: WritingCriterialEvaluation;

  @ValidateNested()
  @Type(() => WritingCriterialEvaluation)
  TR: WritingCriterialEvaluation;

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
