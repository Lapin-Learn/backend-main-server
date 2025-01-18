import { GenAIModelAbstract } from "@app/types/abstracts";
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from "@google/generative-ai";

export class GenAISpeakingScoreModel extends GenAIModelAbstract {
  constructor(readonly genAIManager: GoogleGenerativeAI) {
    super(genAIManager);
  }

  getSchema(): ResponseSchema {
    const schema: ResponseSchema = {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          part: {
            type: SchemaType.STRING,
            description: "'1', '2' or 'overall'",
          },
          criterias: {
            type: SchemaType.OBJECT,
            properties: {
              FC: {
                type: SchemaType.OBJECT,
                properties: {
                  score: {
                    type: SchemaType.NUMBER,
                    description: "Score for Fluency and Coherence (0-9)",
                  },
                  evaluate: {
                    type: SchemaType.STRING,
                    description: "Fluency and Coherence feedback in Vietnamese",
                  },
                },
                required: ["score", "evaluate"], // Ensure FC fields are required
              },
              LR: {
                type: SchemaType.OBJECT,
                properties: {
                  score: {
                    type: SchemaType.NUMBER,
                    description: "Score for Lexical Resource (0-9)",
                  },
                  evaluate: {
                    type: SchemaType.STRING,
                    description: "Lexical Resource feedback in Vietnamese",
                  },
                },
                required: ["score", "evaluate"], // Ensure LR fields are required
              },
              GRA: {
                type: SchemaType.OBJECT,
                properties: {
                  score: {
                    type: SchemaType.NUMBER,
                    description: "Score for Grammatical Range and Accuracy (0-9)",
                  },
                  evaluate: {
                    type: SchemaType.STRING,
                    description: "Grammatical Range and Accuracy feedback in Vietnamese",
                  },
                },
                required: ["score", "evaluate"], // Ensure GRA fields are required
              },
              P: {
                type: SchemaType.OBJECT,
                properties: {
                  score: {
                    type: SchemaType.NUMBER,
                    description: "Score for Pronunciation (0-9)",
                  },
                  evaluate: {
                    type: SchemaType.STRING,
                    description: "Pronunciation feedback in Vietnamese",
                  },
                },
                required: ["score", "evaluate"], // Ensure P fields are required
              },
            },
            required: ["FC", "LR", "GRA", "P"], // Ensure all criterias fields are required
          },
        },
        required: ["part", "criterias"], // Ensure part and criterias are required
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
        3. Use users' previous feedback to adapt and improve your evaluation (if available).
        4. The evaluate field should be in Vietnamese. The remaining objects should be in English.
        `;
  }
}
