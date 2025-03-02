import { Module } from "@nestjs/common";
import { AISpeakingController } from "./ai-speaking.controller";
import { AISpeakingService } from "./ai-speaking.service";
import { GenAIModule } from "@app/shared-modules/genai";
import { AISpeakingConsumer } from "./ai-speaking.processor";
import { BucketModule } from "../../bucket/bucket.module";
import { AITranscriptConsumer } from "./ai-transcript.processor";

@Module({
  imports: [GenAIModule, BucketModule],
  controllers: [AISpeakingController],
  providers: [AISpeakingService, AISpeakingConsumer, AITranscriptConsumer],
})
export class AISpeakingModule {}
