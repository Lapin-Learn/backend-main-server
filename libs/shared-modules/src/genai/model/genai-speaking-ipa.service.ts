import { GenAIModelAbstract } from "@app/types/abstracts";
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from "@google/generative-ai";

export class GenAISpeakingIPAModel extends GenAIModelAbstract {
  constructor(readonly genAIManager: GoogleGenerativeAI) {
    super(genAIManager);
  }

  getSchema(): ResponseSchema {
    const schema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        ipa: {
          type: SchemaType.STRING,
          description: "The International Phonetic Alphabet (IPA) transcription of the user's speech",
        },
      },
    };
    return schema;
  }

  getSystemInstruction(): string {
    return `
        You are an AI assistant designed to return the International Phonetic Alphabet (IPA) transcription of the user's speech.
      `;
  }
}
