import { LanguageModelV1 } from "@ai-sdk/provider";
import { IGenAIModelAbstract } from "@app/types/interfaces";
import { generateObject, UserContent } from "ai";
import { z, ZodSchema } from "zod";

export abstract class GenAIModelAbstract<T extends ZodSchema<any>> implements IGenAIModelAbstract {
  constructor(private readonly model: LanguageModelV1) {}

  async generateContent(userContent: UserContent = ""): Promise<z.infer<T>> {
    const { object } = await generateObject({
      model: this.model,
      schema: this.getSchema(),
      messages: [
        {
          role: "system",
          content: this.getSystemInstruction(),
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    return object;
  }

  abstract getSystemInstruction(): string;
  abstract getSchema(): T; // Return a Zod schema
}
