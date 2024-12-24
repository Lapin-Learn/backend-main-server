import { Module } from "@nestjs/common";
import { AISpeakingController } from "./ai-speaking.controller";
import { AISpeakingService } from "./ai-speaking.service";
import { GenAIModule } from "@app/shared-modules/genai";

@Module({
  imports: [GenAIModule],
  controllers: [AISpeakingController],
  providers: [AISpeakingService],
})
export class AISpeakingModule {}
