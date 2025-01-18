import { GenAIModelAbstract } from "@app/types/abstracts";
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from "@google/generative-ai";

export class GenAISpeakingModel extends GenAIModelAbstract {
  constructor(readonly genAIManager: GoogleGenerativeAI) {
    super(genAIManager);
  }

  getSchema(): ResponseSchema {
    const schema: ResponseSchema = {
      type: SchemaType.ARRAY,
      description: "A generated IELTS speaking test for three parts.",
      items: {
        type: SchemaType.OBJECT,
        description: "Details of a specific part of the IELTS speaking test.",
        properties: {
          heading: {
            type: SchemaType.STRING,
            description: "The heading or topic of the IELTS speaking test part 2 only.",
          },
          part: {
            type: SchemaType.NUMBER,
            description: `The part number of the IELTS speaking test (1, 2, or 3). 
              Part 2 should be returned as a few-shot example.
              Part 1 and Part 3 should be returned as a list of questions about 3-4 questions.`,
          },
          content: {
            type: SchemaType.ARRAY,
            description: "A string array containing the questions or content generated for this part.",
            items: {
              type: SchemaType.STRING,
            },
          },
        },
        required: ["part", "content"],
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

        Fewshot examples:
        [
        {
          "part": 1,
          "content": [
            "Can you tell me a little about where you grew up?",
            "What is your favorite childhood memory?",
            "Do you keep in touch with your childhood friends?"
          ]
        },
        {
        "part": 2,
        "heading": "Describe a skill you learned as a child that has been useful to your throughout your life.",
        "content": [
          "What the skill is",
          "How you learned it",
          "Who taught you",
          "and explain why this skill has been useful to you."
          ]
        },
        {
          "part": 3,
          "content": [
            "In your opinion, what are the most important skills for children to learn these days?",
            "How have the ways children learn new skills changed compared to when you were a child?",
            "Do you think parents should decide which skills their children should learn, or should children have the freedom to choose for themselves? Why?"
          ]
        }
      ]
      `;
  }
}
