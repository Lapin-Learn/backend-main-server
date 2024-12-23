import { GenAIModelAbstract } from "@app/types/abstracts";
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from "@google/generative-ai";

export class GenAISpeakingScoreModel extends GenAIModelAbstract {
  constructor(readonly genAIManager: GoogleGenerativeAI) {
    super(genAIManager);
  }

  getSchema(): ResponseSchema {
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
    return schema;
  }

  getSystemInstruction(): string {
    return `
        You are an AI assistant designed to evaluate the IELTS Speaking test based on official band score criteria. 
        Your role is to analyze the user's audio input and provide:
        1. A band score (0-9) based on the following categories:
           - Fluency and Coherence: Assess how smoothly the user speaks and organizes ideas.
           - Lexical Resource: Evaluate vocabulary usage, range, and appropriateness.
           - Grammatical Range and Accuracy: Check sentence structures and error frequency.
           - Pronunciation: Determine clarity, stress, rhythm, and intonation.
        2. Feedback: Offer specific and constructive feedback for improvement in each category.
        `;
  }
}
