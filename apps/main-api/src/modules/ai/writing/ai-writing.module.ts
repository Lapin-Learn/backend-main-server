import { Module } from "@nestjs/common";
import { AIWritingController } from "./ai-writing.controller";
import { AIWritingService } from "./ai-writing.service";
import { GenAIModule } from "@app/shared-modules/genai";

@Module({
  imports: [GenAIModule],
  controllers: [AIWritingController],
  providers: [AIWritingService],
})
export class AIWritingModule {}
