import { GenerativeModel, GoogleGenerativeAI, ResponseSchema } from "@google/generative-ai";

export abstract class GenAIModelAbstract {
  protected model: GenerativeModel;
  constructor(protected readonly genAIManager: GoogleGenerativeAI) {
    this.model = this.genAIManager.getGenerativeModel({
      model: "gemini-exp-1206",
      // model: "gemini-2.0-flash-thinking-exp-1219",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: this.getSchema(),
        temperature: 2,
      },
      systemInstruction: this.getSystemInstruction(),
    });
  }
  abstract getSchema(): ResponseSchema;
  abstract getSystemInstruction(): string;

  async generateContent(prompt: any = "Follow the system instructions") {
    const rawResult = await this.model.generateContent(prompt);
    return JSON.parse(rawResult.response.text());
  }
}
