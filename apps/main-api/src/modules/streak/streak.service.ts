import { Account, LearnerProfile, Streak } from "@app/database";
import { SetTargetStreak } from "@app/types/dtos";
import { IActivity, ICurrentUser, ILearnerProfile, IProfileStreakActivity } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { In } from "typeorm";
import { StreakHelper } from "./streak.helper";
import moment from "moment-timezone";
import { DayLabelMap } from "@app/utils/maps";
import { MailService } from "@app/shared-modules/mail";
import { LIST_DAYS } from "@app/types/constants";

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);

  constructor(
    private readonly streakHelper: StreakHelper,
    private readonly mailService: MailService
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

  // Remind about missing streak at 20:00 GMT+7
  @Cron("0 20 * * *", {
    name: "Remind about missing streak",
    timeZone: "Asia/Saigon",
  })
  async remindAboutMissingStreak() {
    try {
      this.logger.log("Remind about missing streak");
      const unUpdatedStreakProfiles = await LearnerProfile.getUnUpdatedStreakProfiles();
      const streakActivities = await this.getStreakActivitiesOfWeek(unUpdatedStreakProfiles);

      for (const streakActivity of streakActivities) {
        const subject = `Chào ${streakActivity.username}, đừng đánh mất ${streakActivity.currentStreak} ngày streak nhé!`;
        await this.mailService.sendMail(streakActivity.email, subject, "remind-streak", streakActivity);
        this.logger.log(`Remind ${streakActivity.username} that he/she are going to lose streak`);
      }
      this.logger.log("Remind about missing streak done");
    } catch (error) {
      this.logger.error("fail to remind going to lose streak - Error: ", error);
    }
  }

  // Remind missing streak at 15:00 GMT+7
  @Cron("0 15 * * *", {
    name: "Remind missing streak",
    timeZone: "Asia/Saigon",
  })
  async remindMissingStreak() {
    try {
      this.logger.log("Remind missing streak");
      const missingStreakProfiles = await LearnerProfile.getMissingStreakProfiles();
      const streakActivities = await this.getStreakActivitiesOfWeek(missingStreakProfiles);

      for (const streakActivity of streakActivities) {
        const subject = `Chào ${streakActivity.username}, cùng bắt đầu lại chuỗi streak nhé!`;
        await this.mailService.sendMail(streakActivity.email, subject, "missing-streak", streakActivity);
        this.logger.log(`Remind ${streakActivity.username} that he/she have lost streak`);
      }
      this.logger.log("Remind missing streak done");
    } catch (error) {
      this.logger.error("fail to remind lost streak - Error: ", error);
    }
  }

  async getStreakActivitiesOfWeek(learners: ILearnerProfile[]): Promise<IProfileStreakActivity[]> {
    const streakActivities: IProfileStreakActivity[] = [];
    const beginDate = moment().tz("Asia/Saigon").startOf("week").utc(true).toDate();
    const currentDate = moment().tz("Asia/Saigon").utc(true).toDate();
    for (const profile of learners) {
      const streakActivity: IActivity[] = await LearnerProfile.getDailyStreakActivities(
        profile.id,
        beginDate,
        currentDate
      );
      const account = await Account.findOne({ where: { learnerProfileId: profile.id } });
      streakActivities.push({
        email: account.email,
        username: account.username,
        currentStreak: profile.streak.current,
        activities: LIST_DAYS.map((day) => {
          const today = moment();
          let status: string;
          if (moment().day(day).isAfter(today)) {
            status = "NOT_UP_COMING";
          } else {
            const activity = streakActivity.find((activity) => moment(activity.finishedAt).format("dddd") === day);
            status = activity ? "DONE" : "NOT_DONE";
          }
          return {
            dayLabel: DayLabelMap.get(day),
            status,
            isToday: moment().format("dddd") === day,
          };
        }),
      });
    }

    return streakActivities;
  }
}
