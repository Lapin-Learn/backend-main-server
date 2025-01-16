import { GenAIModelAbstract } from "@app/types/abstracts";
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from "@google/generative-ai";

export class GenAIWritingScoreModel extends GenAIModelAbstract {
  constructor(protected readonly genAIManager: GoogleGenerativeAI) {
    super(genAIManager);
    this.model = this.genAIManager.getGenerativeModel({
      model: "learnlm-1.5-pro-experimental",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: this.getSchema(),
        temperature: 2,
      },
      systemInstruction: this.getSystemInstruction(),
    });
  }

  getSchema(): ResponseSchema {
    const schema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        result: {
          type: SchemaType.ARRAY,
          description: "The results of two parts and overall, three items in total",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              part: {
                type: SchemaType.STRING,
                description: "'1', '2' or 'overall'",
              },
              score: {
                type: SchemaType.NUMBER,
                description: "The estimated band score for this part",
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
                  },
                },
                required: ["CC", "LR", "GRA", "TR"],
              },
            },
            required: ["score", "criterias", "part"],
          },
        },
      },
      required: ["result"],
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
        2. User can provide a written response for part 1 or part 2 of the IELTS Writing test, and you will evaluate it based on the user's response.
        . The feedback object should be in Vietnamese. The remaining objects should be in English.
        `;
  }
}
