import { z } from "zod";

const CriteriaSchema = z.object({
  score: z.number().min(0).max(9).describe("Score (0-9)"),
  evaluate: z.string().describe("Detailed feedback in Vietnamese"),
});

const ResponseSchemaWritingEvaluation = z.array(
  z.object({
    part: z.enum(["1", "2", "overall"]).describe("'1', '2' or 'overall'"),
    criterias: z.object({
      CC: CriteriaSchema.describe("Coherence and Cohesion"),
      LR: CriteriaSchema.describe("Lexical Resource"),
      GRA: CriteriaSchema.describe("Grammatical Range and Accuracy"),
      TR: CriteriaSchema.describe("Task Response"),
    }),
  })
);

type TResponseSchemaWritingEvaluation = z.infer<typeof ResponseSchemaWritingEvaluation>;

export { ResponseSchemaWritingEvaluation, TResponseSchemaWritingEvaluation };
