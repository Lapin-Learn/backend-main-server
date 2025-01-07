import { GenAIModelAbstract } from "@app/types/abstracts";
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from "@google/generative-ai";

export class GenAIWritingScoreModel extends GenAIModelAbstract {
  constructor(readonly genAIManager: GoogleGenerativeAI) {
    super(genAIManager);
  }

  getSchema(): ResponseSchema {
    const schema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        score: {
          type: SchemaType.NUMBER,
          description: "The estimated band score",
        },
        fluencyAndCoherence: {
          type: SchemaType.STRING,
          description: "Fluency and Coherence feedback",
        },
        lexicalResource: {
          type: SchemaType.STRING,
          description: "Lexical Resource feedback",
        },
        grammaticalAndRangeAccuracy: {
          type: SchemaType.STRING,
          description: "Grammatical Range and Accuracy feedback",
        },
        taskResponse: {
          type: SchemaType.STRING,
          description: "Task response feedback",
        },
      },
      required: ["score", "fluencyAndCoherence", "lexicalResource", "grammaticalAndRangeAccuracy", "taskResponse"],
    };
    return schema;
  }

  getSystemInstruction(): string {
    return `
        You are an AI assistant designed to evaluate the IELTS Writing test based on official band score criteria.
        You will analyze the user's written response in part 1 or part 2 of the IELTS Writing test.
        Your role is to analyze the user's audio input and provide:
        1. A band score (0-9) based on the following categories:
           - Fluency and Coherence: Assess how smoothly the user speaks and organizes ideas.
           - Lexical Resource: Evaluate vocabulary usage, range, and appropriateness.
           - Grammatical Range and Accuracy: Check sentence structures and error frequency.
           - Task Response: Evaluate how well the user addresses the prompt and stays on topic.
        2. Feedback: Offer specific and constructive feedback for improvement in each category.
        `;
  }
}
