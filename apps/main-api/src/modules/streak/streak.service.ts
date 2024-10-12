import { LearnerProfile, Streak } from "@app/database";
import { SetTargetStreak } from "@app/types/dtos";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { In } from "typeorm";
import { StreakHelper } from "./streak.helper";
import moment from "moment-timezone";

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);

  constructor(private readonly streakHelper: StreakHelper) {}

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

  // Reset streak in midnight GMT+7
  @Cron("0 0 * * *", {
    name: "Reset streak",
    timeZone: "Asia/Saigon",
  })
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
      const today = moment().tz("Asia/Saigon").endOf("day").toDate();

      if (moment(startDate).isAfter(today)) {
        throw new BadRequestException("Start date cannot be later than end of today");
      }

      const dailyStreakActivities = await LearnerProfile.getDailyStreakActivities(user.profileId, startDate, today);
      return this.streakHelper.buildStreakHistoryResponseData(dailyStreakActivities);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
