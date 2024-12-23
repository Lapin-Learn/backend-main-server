import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { AISpeakingService } from "./ai-speaking.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("ai/speaking")
export class AISpeakingController {
  constructor(private readonly aiSpeakingService: AISpeakingService) {}
  @Post("scoring")
  @UseInterceptors(FileInterceptor("file"))
  async generateResponse(@UploadedFile() file: Express.Multer.File) {
    return this.aiSpeakingService.generateScore(file);
  }

  @Post("speech-evaluation")
  @UseInterceptors(FileInterceptor("file"))
  async generateIpaEvaluation(@UploadedFile() file: Express.Multer.File, @Body("original") original: string) {
    return this.aiSpeakingService.generateIpaEvaluation(file, original);
  }

  @Get("questions")
  async generateQuestion() {
    return this.aiSpeakingService.generateQuestion();
  }
}
