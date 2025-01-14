import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AISpeakingModule } from "./speaking/ai-speaking.module";

@Module({
  imports: [ConfigModule, AISpeakingModule],
})
export class AIModule {}
