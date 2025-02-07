import {
  BadRequestException,
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
import { SpeakingResponseDto } from "@app/types/dtos/simulated-tests";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateSkillTestDto } from "@app/types/dtos";

@UseGuards(RoleGuard)
@UseGuards(FirebaseJwtAuthGuard)
@Controller("ai/speaking")
export class AISpeakingController {
  constructor(private readonly aiSpeakingService: AISpeakingService) {}

  @Roles(AccountRoleEnum.LEARNER)
  @Post("score")
  @UseInterceptors(FileInterceptor("file"))
  async generateResponse(
    @Body("response") response: any,
    @Body("sessionId", new ParseIntPipe()) sessionId: number,
    @UploadedFile("file") file: Express.Multer.File
  ) {
    const instance = plainToInstance(SpeakingResponseDto, JSON.parse(response));
    const errors = await validate(instance);
    if (errors.length > 0) {
      throw new BadRequestException("invalid data");
    }
    return this.aiSpeakingService.generateScore(sessionId, file, instance.info);
  }

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
