import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AISpeakingModule } from "./speaking/ai-speaking.module";
import { AIWritingModule } from "./writing/ai-writing.module";

@Module({
  imports: [ConfigModule, AISpeakingModule, AIWritingModule],
})
export class AIModule {}
