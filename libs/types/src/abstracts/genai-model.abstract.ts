import { GenerativeModel, GoogleGenerativeAI, ResponseSchema } from "@google/generative-ai";

export abstract class GenAIModelAbstract {
  protected model: GenerativeModel;
  constructor(protected readonly genAIManager: GoogleGenerativeAI) {
    this.model = this.genAIManager.getGenerativeModel({
      model: "gemini-1.5-pro",
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

  async generateContent(prompt: any = "") {
    const rawResult = await this.model.generateContent(prompt);
    return JSON.parse(rawResult.response.text());
  }
}
