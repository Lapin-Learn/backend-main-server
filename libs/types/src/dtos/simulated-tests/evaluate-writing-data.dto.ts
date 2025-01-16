import { IsInt, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { InfoTextResponseDto } from "./update-session.dto";

export class EvaluateWritingData {
  @IsInt()
  sessionId: number;

  @ValidateNested({ each: true })
  @Type(() => InfoTextResponseDto)
  userResponse: InfoTextResponseDto[];
}
