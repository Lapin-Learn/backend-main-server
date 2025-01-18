import { IsArray, IsInt, IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { InfoSpeakingResponseDto } from "./update-session.dto";
import { ICurrentUser } from "@app/types/interfaces";

export class EvaluateSpeakingData {
  @IsInt()
  sessionId: number;

  @IsNotEmpty()
  speakingFiles: Array<Express.Multer.File>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfoSpeakingResponseDto)
  userResponse: InfoSpeakingResponseDto[];

  @IsNotEmpty()
  learner: ICurrentUser;
}
