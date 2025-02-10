import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { CreateSkillTestDto } from "@app/types/dtos";

@UseGuards(RoleGuard)
@UseGuards(FirebaseJwtAuthGuard)
@Controller("ai/speaking")
export class AISpeakingController {
  constructor(private readonly aiSpeakingService: AISpeakingService) {}

  @Roles(AccountRoleEnum.LEARNER)
  @Post("speech-evaluation")
  @UseInterceptors(FileInterceptor("file"))
  async generateIpaEvaluation(@UploadedFile() file: Express.Multer.File, @Body("original") original: string) {
    return this.aiSpeakingService.getIpaEvaluation(file, original);
  }

  @Roles(AccountRoleEnum.ADMIN)
  @Post("questions/generate")
  async generateQuestion(@Body() dto: CreateSkillTestDto) {
    return this.aiSpeakingService.generateQuestion(dto);
  }

  @Roles(AccountRoleEnum.LEARNER)
  @Get("questions/:id/evaluation")
  async getEvaluationByQuestionId(@Param("id", new ParseIntPipe()) id: number, @CurrentUser() user: ICurrentUser) {
    return this.aiSpeakingService.getEvaluationByQuestionId(id, user);
  }
}
