import { Account, LearnerProfile, Streak } from "@app/database";
import { SetTargetStreak } from "@app/types/dtos";
import { ICurrentUser } from "@app/types/interfaces";
import { getUTCEndOfDay } from "@app/utils/time";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { In } from "typeorm";
import { StreakHelper } from "./streak.helper";

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);

  constructor(private readonly streakHelper: StreakHelper) {}

  async setTargetStreak(user: ICurrentUser, dto: SetTargetStreak) {
    try {
      const account = await Account.findOne({ where: { id: user.userId } });
      const streak = account.learnerProfile.streak;
      await Streak.update({ id: streak.id }, { target: dto.target });
      return Streak.findOne({ where: { id: streak.id } });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  @Cron("0 7 * * *") // Midnight in GMT+7 (system uses UTC)
  async resetStreak() {
    try {
      this.logger.log("Reset streak");

      const brokenStreakProfiles = await LearnerProfile.getBrokenStreakProfiles();

      if (brokenStreakProfiles.length > 0) {
        await Streak.update({ id: In(brokenStreakProfiles.map((profile) => profile.streakId)) }, { current: 0 });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getStreakHistory(user: ICurrentUser, startDate: Date) {
    try {
      const yesterday = getUTCEndOfDay(new Date(), 1);

      if (startDate > yesterday) {
        throw new BadRequestException("Start date cannot be later than yesterday");
      }

      const getDailyLoginActivities = await Account.getDailyLoginActivities(user.userId, startDate, yesterday);
      return this.streakHelper.buildStreakHistoryResponseData(getDailyLoginActivities);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
