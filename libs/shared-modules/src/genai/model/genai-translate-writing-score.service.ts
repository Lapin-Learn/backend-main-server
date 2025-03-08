import { GenAIModelAbstract } from "@app/types/abstracts";
import { ResponseSchemaWritingEvaluation } from "@app/types/zods";

export class GenAITranslateWritingScoreModel extends GenAIModelAbstract<typeof ResponseSchemaWritingEvaluation> {
  getSchema() {
    return ResponseSchemaWritingEvaluation;
  }

  getSystemInstruction(): string {
    return `Translate 'error', 'correction' and 'explanation' into English'`;
  }
}
