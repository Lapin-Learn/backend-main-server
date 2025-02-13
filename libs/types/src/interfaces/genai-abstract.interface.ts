import { UserContent } from "ai";

export interface IGenAIModelAbstract {
  getSystemInstruction(): string;
  getSchema(): any;
  generateContent(userContent: UserContent): Promise<any>;
}
