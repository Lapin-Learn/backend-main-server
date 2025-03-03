import { LearnerProfile } from "@app/database";
import { SetTargetStreak } from "@app/types/dtos";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { StreakHelper } from "./streak.helper";
import moment from "moment-timezone";
import {
  REMIND_ABOUT_MISSING_STREAK_JOB,
  REMIND_MISSING_STREAK_JOB,
  REMIND_STREAK_MILESTONE_JOB,
  RESET_STREAK_JOB,
  STREAK_CRON_JOB,
  VN_TIME_ZONE,
} from "@app/types/constants";
import { getEndOfOffsetDay } from "@app/utils/time";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);

  constructor(
    private readonly streakHelper: StreakHelper,
    @InjectQueue(STREAK_CRON_JOB) private readonly streakQueue: Queue
  ) {}

  async setTargetStreak(user: ICurrentUser, dto: SetTargetStreak) {
    try {
      const learnerProfile = await LearnerProfile.findOne({ where: { id: user.profileId } });
      learnerProfile.streak.target = dto.target;
      await learnerProfile.streak.save();
      return learnerProfile.streak;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getStreakHistory(user: ICurrentUser, startDate: Date) {
    try {
      const today = getEndOfOffsetDay(0);

      if (moment(startDate).utc(true).isAfter(today)) {
        throw new BadRequestException("Start date cannot be later than end of today");
      }

      const dailyStreakActivities = await LearnerProfile.getDailyStreakActivities(user.profileId, startDate, today);
      const freezeStreakActivities = await LearnerProfile.getFreezeStreakActivities(user.profileId, startDate, today);
      return this.streakHelper.buildStreakHistoryResponseData(dailyStreakActivities, freezeStreakActivities);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  // Reset streak at midnight GMT+7
  @Cron("0 0 * * *", {
    name: "Reset streak",
    timeZone: VN_TIME_ZONE,
  })
  async resetStreak() {
    await this.streakQueue.add(RESET_STREAK_JOB, {});
  }

  // Remind about missing streak at 20:00 GMT+7
  @Cron("0 20 * * *", {
    name: "Remind about missing streak",
    timeZone: VN_TIME_ZONE,
  })
  async remindAboutMissingStreak() {
    await this.streakQueue.add(REMIND_ABOUT_MISSING_STREAK_JOB, {});
  }

  // Remind missing streak at 15:00 GMT+7
  @Cron("0 15 * * *", {
    name: "Remind missing streak",
    timeZone: VN_TIME_ZONE,
  })
  async remindMissingStreak() {
    await this.streakQueue.add(REMIND_MISSING_STREAK_JOB, {});
  }

  // Remind streak milestone at 8:00 GMT+7
  @Cron("0 8 * * *", {
    name: "Remind streak milestone",
    timeZone: VN_TIME_ZONE,
  })
  async remindStreakMileStone() {
    await this.streakQueue.add(REMIND_STREAK_MILESTONE_JOB, {});
  }
}
