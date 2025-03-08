import { GenAIModelAbstract } from "@app/types/abstracts";
import { ResponseSchemaSpeakingEvaluation } from "@app/types/zods";

export class GenAITranslateSpeakingScoreModel extends GenAIModelAbstract<typeof ResponseSchemaSpeakingEvaluation> {
  getSchema() {
    return ResponseSchemaSpeakingEvaluation;
  }

  getSystemInstruction(): string {
    return `Translate 'evaluate' field into English.`;
  }
}
