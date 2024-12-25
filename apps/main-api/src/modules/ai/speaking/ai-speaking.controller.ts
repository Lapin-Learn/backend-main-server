import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AISpeakingService } from "./ai-speaking.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { FirebaseJwtAuthGuard, RoleGuard } from "apps/main-api/src/guards";
import { CurrentUser, Roles } from "apps/main-api/src/decorators";
import { AccountRoleEnum } from "@app/types/enums";
import { ICurrentUser } from "@app/types/interfaces";

@UseGuards(RoleGuard)
@UseGuards(FirebaseJwtAuthGuard)
@Controller("ai/speaking")
export class AISpeakingController {
  constructor(private readonly aiSpeakingService: AISpeakingService) {}

  @Roles(AccountRoleEnum.LEARNER)
  @Post("score")
  @UseInterceptors(FileInterceptor("file"))
  async generateResponse(
    @Body("id", new ParseUUIDPipe()) id: string,
    @Body("part", new ParseIntPipe()) part: number,
    @Body("order", new ParseIntPipe()) order: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: ICurrentUser
  ) {
    return this.aiSpeakingService.generateScore(id, part, order, file, user);
  }

  @Post("speech-evaluation")
  @UseInterceptors(FileInterceptor("file"))
  async generateIpaEvaluation(@UploadedFile() file: Express.Multer.File, @Body("original") original: string) {
    return this.aiSpeakingService.generateIpaEvaluation(file, original);
  }

  @Roles(AccountRoleEnum.ADMIN)
  @Get("questions")
  async generateQuestion() {
    return this.aiSpeakingService.generateQuestion();
  }

  @Roles(AccountRoleEnum.LEARNER)
  @Get("questions/:id")
  async generateQuestionById(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.aiSpeakingService.getQuestionById(id);
  }

  @Roles(AccountRoleEnum.LEARNER)
  @Get("questions/:id/evaluation")
  async getEvaluationByQuestionId(@Param("id", new ParseUUIDPipe()) id: string, @CurrentUser() user: ICurrentUser) {
    return this.aiSpeakingService.getEvaluationByQuestionId(id, user);
  }
}
