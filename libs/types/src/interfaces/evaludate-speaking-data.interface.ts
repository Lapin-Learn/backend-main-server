import { InfoSpeakingResponseDto } from "../dtos/simulated-tests";

export interface IEvaluateSpeakingData {
  sessionId: number;
  speakingFile: Express.Multer.File;
  userResponse: InfoSpeakingResponseDto[];
}
