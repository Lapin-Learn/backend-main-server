import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard, RoleGuard } from "apps/main-api/src/guards";
import { AIWritingService } from "./ai-writing.service";
import { CurrentUser, Roles } from "apps/main-api/src/decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { AccountRoleEnum } from "@app/types/enums";
import { plainToInstance } from "class-transformer";
import { TextResponseDto } from "@app/types/dtos/simulated-tests";
import { validate } from "class-validator";

@UseGuards(RoleGuard)
@UseGuards(FirebaseJwtAuthGuard)
@Controller("ai/writing")
export class AIWritingController {
  constructor(private readonly aiWritingService: AIWritingService) {}

  @Roles(AccountRoleEnum.LEARNER)
  @Post("score")
  async generateScore(@Body("response") response: any, @Body("sessionId", new ParseIntPipe()) sessionId: number) {
    const instance = plainToInstance(TextResponseDto, JSON.parse(response));
    const errs = await validate(instance);
    if (errs.length > 0) {
      throw new BadRequestException("invalid data");
    }
    return this.aiWritingService.generateScore(sessionId, response);
  }

  @Roles(AccountRoleEnum.LEARNER)
  @Get("feedback/:sessionId")
  async getFeedback(@CurrentUser() user: ICurrentUser, @Param("sessionId", new ParseIntPipe()) sessionId: number) {
    return this.aiWritingService.getFeedback(user, sessionId);
  }
}
