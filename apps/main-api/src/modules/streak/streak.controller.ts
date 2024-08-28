import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard, RoleGuard } from "../../guards";
import { CurrentUser, Roles } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { StreakService } from "./streak.service";
import { SetTargetStreak } from "@app/types/dtos";
import { AccountRoleEnum } from "@app/types/enums";
import { getUTCBeginOfDay } from "@app/utils/time";

@UseGuards(FirebaseJwtAuthGuard)
@Controller("streaks")
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(AccountRoleEnum.LEARNER)
  setTargetStreak(@CurrentUser() user: ICurrentUser, @Body() dto: SetTargetStreak) {
    return this.streakService.setTargetStreak(user, dto);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles(AccountRoleEnum.LEARNER)
  getStreakHistory(@CurrentUser() user: ICurrentUser, @Query("start") start: string) {
    const startDate = start ? getUTCBeginOfDay(new Date(start)) : getUTCBeginOfDay(new Date(), 7);
    return this.streakService.getStreakHistory(user, startDate);
  }
}
