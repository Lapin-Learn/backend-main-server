import { GENAI_SPEECH_TO_IPA } from "@app/types/constants";
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from "@google/generative-ai";
import { FactoryProvider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const GenAISpeech2IPAProvider: FactoryProvider = {
  provide: GENAI_SPEECH_TO_IPA,
  useFactory: async (configService: ConfigService) => {
    const schema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        ipa: {
          type: SchemaType.STRING,
          description: "The International Phonetic Alphabet (IPA) transcription of the user's speech",
        },
      },
    };

    const genAI = new GoogleGenerativeAI(configService.get("GEMINI_API_KEY"));
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
      systemInstruction: `
        You are an AI assistant designed to return the International Phonetic Alphabet (IPA) transcription of the user's speech.
        `,
    });

    return model;
  },
  inject: [ConfigService],
};
