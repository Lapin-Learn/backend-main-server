import { GENAI_FILE_MANAGER, GENAI_MANAGER } from "@app/types/constants";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: GENAI_MANAGER,
      useFactory: async (configService: ConfigService) => {
        const genAI = new GoogleGenerativeAI(configService.get("GEMINI_API_KEY"));
        return genAI;
      },
      inject: [ConfigService],
    },
    {
      provide: GENAI_FILE_MANAGER,
      useFactory: async (configService: ConfigService) => {
        return new GoogleAIFileManager(configService.get("GEMINI_API_KEY"));
      },
      inject: [ConfigService],
    },
  ],
  exports: [GENAI_MANAGER, GENAI_FILE_MANAGER],
})
export class GenAIModule {}
