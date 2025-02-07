import { GenAIModelAbstract } from "@app/types/abstracts";
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from "@google/generative-ai";

export class GenAIWritingScoreModel extends GenAIModelAbstract {
  constructor(protected readonly genAIManager: GoogleGenerativeAI) {
    super(genAIManager);
  }

  getSchema(): ResponseSchema {
    const schema: ResponseSchema = {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        description: "Exactly 3 object for each part (1, 2, overall)",
        properties: {
          part: {
            type: SchemaType.STRING,
            description: "'1', '2' or 'overall'",
          },
          criterias: {
            type: SchemaType.OBJECT,
            properties: {
              CC: {
                type: SchemaType.OBJECT,
                properties: {
                  score: {
                    type: SchemaType.NUMBER,
                    description: "Score for Coherence and cohesion (0-9)",
                  },
                  evaluate: {
                    type: SchemaType.STRING,
                    description: "Detailed feedback on Coherence and cohesion in Vietnamese",
                  },
                },
                required: ["score", "evaluate"], // Ensure all CC fields are required
              },
              LR: {
                type: SchemaType.OBJECT,
                properties: {
                  score: {
                    type: SchemaType.NUMBER,
                    description: "Score for lexical resource (0-9)",
                  },
                  evaluate: {
                    type: SchemaType.STRING,
                    description: "Detailed feedback on lexical resource in Vietnamese",
                  },
                },
                required: ["score", "evaluate"], // Ensure all LR fields are required
              },
              GRA: {
                type: SchemaType.OBJECT,
                properties: {
                  score: {
                    type: SchemaType.NUMBER,
                    description: "Score for grammatical range and accuracy (0-9)",
                  },
                  evaluate: {
                    type: SchemaType.STRING,
                    description: "Detailed feedback on grammatical range and accuracy in Vietnamese",
                  },
                },
                required: ["score", "evaluate"], // Ensure all GRA fields are required
              },
              TR: {
                type: SchemaType.OBJECT,
                properties: {
                  score: {
                    type: SchemaType.NUMBER,
                    description: "Score for task response (0-9)",
                  },
                  evaluate: {
                    type: SchemaType.STRING,
                    description: "Detailed feedback on task response in Vietnamese",
                  },
                },
                required: ["score", "evaluate"], // Ensure all TR fields are required
              },
            },
            required: ["CC", "LR", "GRA", "TR"], // Ensure all criterias fields are required
          },
        },
        required: ["part", "criterias"], // Ensure part and criterias are required
      },
    };
    return schema;
  }

  getSystemInstruction(): string {
    return `
        You are an AI assistant designed to evaluate the IELTS Writing test based on official band score criteria.
        You will analyze the user's written response in part 1 or part 2 of the IELTS Writing test.
        Your role is to analyze the user's audio input and provide:
        1. A band score (0-9) based on the following categories:
           - Coherence and cohesion: Evaluate the logical flow of ideas, effective paragraphing, and use of cohesive devices without overuse or redundancy.
           - Lexical Resource: Evaluate vocabulary usage, range, and appropriateness.
           - Grammatical Range and Accuracy: Check sentence structures and error frequency.
           - Task Response: Evaluate how well the user addresses the prompt and stays on topic.
        2. User can provide a written response for part 1 or part 2 of the IELTS Writing test, and you will evaluate it based on the user's response.
        3. The evaluate field should be in Vietnamese. The remaining objects should be in English.
        4. You must return exactly 3 objects for each part (1, 2, overall), regardless of the user's input.
        `;
  }
}
