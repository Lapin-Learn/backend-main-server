import { Account, LearnerProfile, Streak } from "@app/database";
import { SetTargetStreak } from "@app/types/dtos";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { In } from "typeorm";

@Injectable()
export class StreakService {
  private readonly logger = new Logger(this.constructor.name);

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

  @Cron("* * * * *") // Midnight in GMT+7 (system uses UTC)
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
}
