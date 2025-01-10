import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard, RoleGuard } from "apps/main-api/src/guards";
import { AIWritingService } from "./ai-writing.service";
import { CurrentUser, Roles } from "apps/main-api/src/decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { AccountRoleEnum } from "@app/types/enums";
import { AIWritingEvaluationDto } from "@app/types/dtos";

@UseGuards(RoleGuard)
@UseGuards(FirebaseJwtAuthGuard)
@Controller("ai/writing")
export class AIWritingController {
  constructor(private readonly aiWritingService: AIWritingService) {}

  @Roles(AccountRoleEnum.LEARNER)
  @Post("score")
  async generateScore(@CurrentUser() user: ICurrentUser, @Body() dto: AIWritingEvaluationDto) {
    return this.aiWritingService.generateScore(user, dto);
  }

  @Roles(AccountRoleEnum.LEARNER)
  @Get("feedback/:sessionId")
  async getFeedback(@CurrentUser() user: ICurrentUser, @Param("sessionId", new ParseIntPipe()) sessionId: number) {
    return this.aiWritingService.getFeedback(user, sessionId);
  }
}
