import { IsArray, IsInt, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { InfoSpeakingResponseDto } from "./update-session.dto";

export class EvaluateSpeakingData {
  @IsInt()
  sessionId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfoSpeakingResponseDto)
  userResponse: InfoSpeakingResponseDto[];
}
