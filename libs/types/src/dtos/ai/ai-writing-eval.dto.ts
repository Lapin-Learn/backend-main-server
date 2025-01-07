import { IsNumber, IsString } from "class-validator";

export class AIWritingEvaluationDto {
  @IsNumber()
  sessionId: number;

  @IsNumber()
  part: number;

  @IsString()
  data: string;
}
