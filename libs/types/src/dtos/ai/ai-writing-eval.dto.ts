import { IsNumber, IsString } from "class-validator";

export class AIWritingEvaluationDto {
  @IsNumber()
  sessionId: number;

  @IsString()
  part1: string;

  @IsString()
  part2: string;
}
