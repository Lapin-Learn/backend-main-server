import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
  Min,
  Max,
  IsEnum,
  ArrayMinSize,
  ArrayMaxSize,
} from "class-validator";

enum WritingPartEnum {
  PART_1 = "1",
  PART_2 = "2",
  OVERALL = "overall",
}

class ScoreEvaluationDto {
  @IsNumber()
  @Min(0)
  @Max(9)
  score: number;

  @IsString()
  evaluate: string;
}

class WritingCriteriaDto {
  @ValidateNested()
  @Type(() => ScoreEvaluationDto)
  CC: ScoreEvaluationDto;

  @ValidateNested()
  @Type(() => ScoreEvaluationDto)
  LR: ScoreEvaluationDto;

  @ValidateNested()
  @Type(() => ScoreEvaluationDto)
  GRA: ScoreEvaluationDto;

  @ValidateNested()
  @Type(() => ScoreEvaluationDto)
  TR: ScoreEvaluationDto;
}

export class WritingResultItemDto {
  @IsEnum(WritingPartEnum)
  part: WritingPartEnum;

  @IsNumber()
  @Min(0)
  @Max(9)
  score: number;

  @ValidateNested()
  @Type(() => WritingCriteriaDto)
  criterias: WritingCriteriaDto;
}

export class WritingEvaluation {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @Type(() => WritingResultItemDto)
  result: WritingResultItemDto[];
}
