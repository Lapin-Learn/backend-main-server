import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsNumber, IsString, ValidateNested } from "class-validator";

export class WritingCriterialEvaluation {
  @IsNumber()
  score: number;

  @IsString()
  feedback: string;
}

export class WritingEachPartEvaluation {
  @ValidateNested()
  CC: WritingCriterialEvaluation;

  @ValidateNested()
  LR: WritingCriterialEvaluation;

  @ValidateNested()
  GRA: WritingCriterialEvaluation;

  @ValidateNested()
  TR: WritingCriterialEvaluation;
}

export class WritingCriterialFeedback {
  @IsString()
  feedback: string;

  @IsString()
  error: string;
}

export class WritingEvaluation {
  @IsNumber()
  score: number;

  @IsArray()
  @ArrayMaxSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => WritingEachPartEvaluation)
  result: WritingEachPartEvaluation[];

  @IsArray()
  @ArrayMaxSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => WritingCriterialFeedback)
  feedback: WritingCriterialFeedback[];
}
