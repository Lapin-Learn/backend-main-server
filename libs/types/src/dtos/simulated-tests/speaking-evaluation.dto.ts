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
  pronounciation: CriterialEvaluation;

  @ValidateNested()
  lexicalResource: CriterialEvaluation;

  @ValidateNested()
  fluencyAndCoherence: CriterialEvaluation;

  @ValidateNested()
  grammaticalAndRangeAccuracy: CriterialEvaluation;
}
