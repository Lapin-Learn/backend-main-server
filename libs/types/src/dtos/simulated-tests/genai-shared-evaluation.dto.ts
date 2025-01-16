import { IsNumber, IsString, Max, Min } from "class-validator";

export class CriterialEvaluation {
  @IsNumber()
  @Min(0)
  @Max(9)
  score: number;

  @IsString()
  evaluate: string;
}
