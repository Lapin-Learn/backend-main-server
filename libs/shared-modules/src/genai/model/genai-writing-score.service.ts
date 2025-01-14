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
          description: "The results of two parts respectively",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              score: {
                type: SchemaType.NUMBER,
                description: "The estimated band score for this part",
              },
              FC: {
                type: SchemaType.OBJECT,
                properties: {
                  score: {
                    type: SchemaType.NUMBER,
                    description: "Score for fluency and coherence (0-9)",
                  },
                  feedback: {
                    type: SchemaType.STRING,
                    description: "Detailed feedback on fluency and coherence",
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
                  feedback: {
                    type: SchemaType.STRING,
                    description: "Detailed feedback on lexical resource",
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
                  feedback: {
                    type: SchemaType.STRING,
                    description: "Detailed feedback on grammatical range and accuracy",
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
                  feedback: {
                    type: SchemaType.STRING,
                    description: "Detailed feedback on task response",
                  },
                },
              },
            },
            required: ["score", "FC", "LR", "GRA", "TR"],
          },
        },
        feedback: {
          type: SchemaType.ARRAY,
          description: "Feedback for each part, this part should be in Vietnamese",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              error: {
                type: SchemaType.STRING,
                description: "The errors in the given text",
              },
              feedback: {
                type: SchemaType.STRING,
                description: "General feedback",
              },
            },
            required: ["error", "feedback"],
          },
        },
        score: {
          type: SchemaType.NUMBER,
          description: "The overall estimated band score",
        },
      },
      required: ["result", "feedback", "score"],
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
        3. Provide the position, length, and type of errors in the user's response.
        4. The feedback object shpuld be in Vietnamese. The remaining objects should be in English.
        `;
  }
}
