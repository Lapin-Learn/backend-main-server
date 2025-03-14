import { z } from "zod";

const CriteriaSchema = z.object({
  score: z.number().min(0).max(9).describe("Score (0-9)"),
  evaluate: z.string().describe("Detailed feedback in Vietnamese"),
});

const ResponseSchemaSpeakingEvaluation = z.object({
  result: z.array(
    z.object({
      part: z.enum(["1", "2", "3", "overall"]).describe("'1', '2', '3' or 'overall'"),
      criterias: z.object({
        FC: CriteriaSchema.describe("Fluency and Coherence"),
        LR: CriteriaSchema.describe("Lexical Resource"),
        GRA: CriteriaSchema.describe("Grammatical Range and Accuracy"),
        P: CriteriaSchema.describe("Pronunciation"),
      }),
    })
  ),
});

type TResponseSchemaSpeakingEvaluation = z.infer<typeof ResponseSchemaSpeakingEvaluation>;

export { ResponseSchemaSpeakingEvaluation, TResponseSchemaSpeakingEvaluation };
