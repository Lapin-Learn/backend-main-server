import { Module } from "@nestjs/common";
import { AISpeakingController } from "./ai-speaking.controller";
import { AISpeakingService } from "./ai-speaking.service";
import { GenAIModule } from "@app/shared-modules/genai";
import { AISpeakingConsumer } from "./ai-speaking.processor";
import { FirebaseModule } from "@app/shared-modules/firebase";

@Module({
  imports: [GenAIModule, FirebaseModule],
  controllers: [AISpeakingController],
  providers: [AISpeakingService, AISpeakingConsumer],
})
export class AISpeakingModule {}
