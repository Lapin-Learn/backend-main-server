import { GENAI_SPEAKING_SCORE_EVALUATION } from "@app/types/constants";
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from "@google/generative-ai";
import { FactoryProvider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const GenAISpeakingScoreProvider: FactoryProvider = {
  provide: GENAI_SPEAKING_SCORE_EVALUATION,
  useFactory: async (configService: ConfigService) => {
    const schema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        bandScore: {
          type: SchemaType.NUMBER,
          description: "The estimated band score",
        },
        feedback: {
          type: SchemaType.STRING,
          description: "Feedback for the user",
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
        You are an AI assistant designed to evaluate the IELTS Speaking test based on official band score criteria. 
        Your role is to analyze the user's audio input and provide:
        1. A band score (0-9) based on the following categories:
           - Fluency and Coherence: Assess how smoothly the user speaks and organizes ideas.
           - Lexical Resource: Evaluate vocabulary usage, range, and appropriateness.
           - Grammatical Range and Accuracy: Check sentence structures and error frequency.
           - Pronunciation: Determine clarity, stress, rhythm, and intonation.
        2. Feedback: Offer specific and constructive feedback for improvement in each category.
        `,
    });

    return model;
  },
  inject: [ConfigService],
};
