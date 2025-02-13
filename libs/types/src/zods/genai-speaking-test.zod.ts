import { z } from "zod";

const ResponseSchemaGenerateSpeakingTest = z.array(
  z.object({
    heading: z.string().describe("The heading or topic of the IELTS speaking test part 2 only.").optional(),
    part: z.string().length(1).describe(`The part number of the IELTS speaking test (1, 2, or 3). 
        Part 2 should be returned as a few-shot example.
        Part 1 and Part 3 should be returned as a list of questions about 3-4 questions.`),
    content: z
      .array(z.string())
      .describe("A string array containing the questions or content generated for this part."),
  })
);

type TResponseSchemaGenerateSpeakingTest = z.infer<typeof ResponseSchemaGenerateSpeakingTest>;

export { TResponseSchemaGenerateSpeakingTest, ResponseSchemaGenerateSpeakingTest };
