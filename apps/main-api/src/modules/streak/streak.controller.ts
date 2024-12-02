import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard, RoleGuard } from "../../guards";
import { ApiDefaultResponses, CurrentUser, Roles } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { StreakService } from "./streak.service";
import { SetTargetStreak } from "@app/types/dtos";
import { AccountRoleEnum } from "@app/types/enums";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import moment from "moment-timezone";
import { VN_TIME_ZONE } from "@app/types/constants";

@ApiTags("Streaks")
@ApiBearerAuth()
@ApiDefaultResponses()
@UseGuards(RoleGuard)
@UseGuards(FirebaseJwtAuthGuard)
@Controller("streaks")
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @ApiOperation({ summary: "Set target streak" })
  @ApiBody({ type: SetTargetStreak })
  @Post()
  @Roles(AccountRoleEnum.LEARNER)
  setTargetStreak(@CurrentUser() user: ICurrentUser, @Body() dto: SetTargetStreak) {
    return this.streakService.setTargetStreak(user, dto);
  }

  @ApiOperation({ summary: "Get streak history" })
  @Get()
  @Roles(AccountRoleEnum.LEARNER)
  getStreakHistory(@CurrentUser() user: ICurrentUser, @Query("start") start: string) {
    const startDate = start
      ? moment(start).tz(VN_TIME_ZONE).startOf("day").utc(true).toDate()
      : moment().tz(VN_TIME_ZONE).startOf("day").utc(true).subtract(7, "days").toDate();

    return this.streakService.getStreakHistory(user, startDate);
  }
}
