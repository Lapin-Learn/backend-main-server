import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard, RoleGuard } from "../../guards";
import { CurrentUser, Roles } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { StreakService } from "./streak.service";
import { SetTargetStreak } from "@app/types/dtos";
import { AccountRoleEnum } from "@app/types/enums";
import { getUTCBeginOfDay } from "@app/utils/time";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Streaks")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("streaks")
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @ApiOperation({ summary: "Set target streak" })
  @ApiBody({ type: SetTargetStreak })
  @ApiResponse({ status: 200, description: "Target streak set successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Post()
  @UseGuards(RoleGuard)
  @Roles(AccountRoleEnum.LEARNER)
  setTargetStreak(@CurrentUser() user: ICurrentUser, @Body() dto: SetTargetStreak) {
    return this.streakService.setTargetStreak(user, dto);
  }

  @ApiOperation({ summary: "Get streak history" })
  @ApiResponse({ status: 200, description: "Streak history retrieved successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Get()
  @UseGuards(RoleGuard)
  @Roles(AccountRoleEnum.LEARNER)
  getStreakHistory(@CurrentUser() user: ICurrentUser, @Query("start") start: string) {
    const startDate = start ? getUTCBeginOfDay(new Date(start)) : getUTCBeginOfDay(new Date(), -7);
    return this.streakService.getStreakHistory(user, startDate);
  }
}
