import { GenAIModelAbstract } from "@app/types/abstracts";
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from "@google/generative-ai";

export class GenAISpeakingModel extends GenAIModelAbstract {
  constructor(readonly genAIManager: GoogleGenerativeAI) {
    super(genAIManager);
  }

  getSchema(): ResponseSchema {
    const schema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        content: {
          type: SchemaType.OBJECT,
          description: "Generated question for the IELTS speaking test",
          properties: {
            name: {
              type: SchemaType.STRING,
              description: "The name after summarizing parts 2 and 3 of the generated questions.",
            },
            part1: {
              type: SchemaType.ARRAY,
              description: "A string array of 3 questions generated for speaking part 1",
              items: {
                type: SchemaType.STRING,
              },
            },
            part2: {
              type: SchemaType.ARRAY,
              description: "A string array of a question only generated for speaking part 2",
              items: {
                type: SchemaType.STRING,
              },
            },
            part3: {
              type: SchemaType.ARRAY,
              description: "A string array of 3 questions generated for speaking part 3",
              items: {
                type: SchemaType.STRING,
              },
            },
          },
          required: ["name", "part1", "part2", "part3"],
        },
      },
    };
    return schema;
  }

  getSystemInstruction(): string {
    return `
        You are an advanced IELTS speaking test examiner and you are creative in generating questions and topics. Your role is to conduct a full IELTS speaking test, which consists of three parts. 
        1. Your generated questions should be relevant to the IELTS speaking test format and cover a various range of topics and language functions.
        2. Adapt the difficulty and type of questions based on the user's performance. Gradually increase the complexity as the conversation progresses.
        3. Follow the structure and timing of the IELTS speaking test:
        - Part 1: Introduction and Interview: Ask personal and introductory questions about familiar topics like home, family, work, studies, and interests.
        - Part 2: Individual Long Turn: Give the user a task card with a topic. The user has 1 minute to prepare and then must speak about the topic for 1-2 minutes.
        - Part 3: Two-Way Discussion: Ask more abstract questions related to the topic discussed in Part 2. This part focuses on expressing and justifying opinions, analyzing, discussing, and speculating about issues.
        4. You MUST generate all three parts of the IELTS speaking test. The user will respond to each question in sequence.
        5. The name should be a summary of the generated questions in part 2 and part 3.
      `;
  }
}
