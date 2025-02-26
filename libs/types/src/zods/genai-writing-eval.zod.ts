import { z } from "zod";

const CriteriaSchema = z.object({
  score: z.number().min(0).max(9).describe("Score (0-9)"),
  evaluate: z.array(
    z.object({
      error: z
        .string()
        .describe(
          "Show the error in the user's writing in Vietnamese, except for quoted and recommended English words."
        ),
      correction: z
        .string()
        .describe("Suggest the correction in Vietnamese, except for quoted and recommended English words."),
      explanation: z
        .string()
        .describe(
          "Explain why the error is wrong and more detailed about feedback in Vietnamese, except for quoted and recommended English words."
        ),
      highlight: z.array(z.string().describe("Words or phrases that have one or more errors in the user's response.")),
    })
  ),
});

const ResponseSchemaWritingEvaluation = z.object({
  result: z.array(
    z.object({
      part: z.enum(["1", "2", "overall"]).describe("'1', '2' or 'overall'"),
      criterias: z.object({
        CC: CriteriaSchema.describe("Coherence and Cohesion"),
        LR: CriteriaSchema.describe("Lexical Resource"),
        GRA: CriteriaSchema.describe("Grammatical Range and Accuracy"),
        TR: CriteriaSchema.describe("Task Response"),
      }),
    })
  ),
});

type TResponseSchemaWritingEvaluation = z.infer<typeof ResponseSchemaWritingEvaluation>;

export { ResponseSchemaWritingEvaluation, TResponseSchemaWritingEvaluation };
