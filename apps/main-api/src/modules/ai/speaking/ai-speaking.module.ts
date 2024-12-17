import { Module } from "@nestjs/common";
import { AISpeakingController } from "./ai-speaking.controller";
import { AISpeakingService } from "./ai-speaking.service";
import { GenAIFileManagerProvider, GenAISpeakingScoreProvider, GenAISpeech2IPAProvider } from "../providers";

@Module({
  controllers: [AISpeakingController],
  providers: [AISpeakingService, GenAISpeakingScoreProvider, GenAIFileManagerProvider, GenAISpeech2IPAProvider],
})
export class AISpeakingModule {}
