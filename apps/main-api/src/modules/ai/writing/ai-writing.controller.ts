import { Controller, Get, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard, RoleGuard } from "apps/main-api/src/guards";
import { AIWritingService } from "./ai-writing.service";
import { CurrentUser, Roles } from "apps/main-api/src/decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { AccountRoleEnum } from "@app/types/enums";

@UseGuards(RoleGuard)
@UseGuards(FirebaseJwtAuthGuard)
@Controller("ai/writing")
export class AIWritingController {
  constructor(private readonly aiWritingService: AIWritingService) {}

  @Roles(AccountRoleEnum.LEARNER)
  @Get("feedback/:sessionId")
  async getFeedback(@CurrentUser() user: ICurrentUser, @Param("sessionId", new ParseIntPipe()) sessionId: number) {
    return this.aiWritingService.getFeedback(user, sessionId);
  }
}
