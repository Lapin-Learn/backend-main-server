import { GENAI_FILE_MANAGER } from "@app/types/constants";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { FactoryProvider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const GenAIFileManagerProvider: FactoryProvider = {
  provide: GENAI_FILE_MANAGER,
  useFactory: async (configService: ConfigService) => {
    return new GoogleAIFileManager(configService.get("GEMINI_API_KEY"));
  },
  inject: [ConfigService],
};
