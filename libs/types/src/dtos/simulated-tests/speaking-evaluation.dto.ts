import { IsNotEmpty, IsNumber, ValidateNested } from "class-validator";

export class CriterialEvaluation {
  @IsNumber()
  score: number;

  @IsNotEmpty()
  evaluate: string;
}

export class SpeakingEvaluation {
  @IsNotEmpty()
  part: string;

  @IsNumber()
  score: number;

  @ValidateNested()
  P: CriterialEvaluation;

  @ValidateNested()
  LR: CriterialEvaluation;

  @ValidateNested()
  FC: CriterialEvaluation;

  @ValidateNested()
  GRA: CriterialEvaluation;
}
