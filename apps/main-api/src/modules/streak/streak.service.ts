import { Account, LearnerProfile, Streak } from "@app/database";
import { SetTargetStreak } from "@app/types/dtos";
import { IActivity, ICurrentUser, ILearnerProfile, IProfileStreakActivity } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { In } from "typeorm";
import { StreakHelper } from "./streak.helper";
import moment from "moment-timezone";
import { DayLabelMap } from "@app/utils/maps";
import {
  ANNOUNCE_STREAK_MILESTONE_WORKFLOW,
  LIST_DAYS,
  REMIND_MISSING_STREAK_WORKFLOW,
  REMIND_STREAK_WORKFLOW,
  VN_TIME_ZONE,
} from "@app/types/constants";
import { NovuService } from "@app/shared-modules/novu";
import { getBeginOfOffsetDay } from "@app/utils/time";

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);

  constructor(
    private readonly streakHelper: StreakHelper,
    private readonly novuService: NovuService
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

  // Reset streak at midnight GMT+7
  @Cron("55 20 * * *", {
    name: "Reset streak",
    timeZone: VN_TIME_ZONE,
  })
  async resetStreak() {
    try {
      this.logger.log("Reset streak");

      const brokenStreakProfiles = await LearnerProfile.getBrokenStreakProfiles();

      // If yesterday streak is not the extended streak, reset the streak to 0.
      const shouldResetProfiles = brokenStreakProfiles.filter((profile) => !profile.streak.extended);
      if (shouldResetProfiles.length > 0) {
        await Streak.update({ id: In(shouldResetProfiles.map((profile) => profile.streakId)) }, { current: 0 });
      }

      // If yesterday streak is the extended streak, mark yesterday is unextended, still store the current for streak freeze effect.
      const shouldUnextendProfiles = brokenStreakProfiles.filter((profile) => profile.streak.extended);
      if (shouldUnextendProfiles.length > 0) {
        await Streak.update({ id: In(shouldUnextendProfiles.map((profile) => profile.streakId)) }, { extended: false });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getStreakHistory(user: ICurrentUser, startDate: Date) {
    try {
      const today = getBeginOfOffsetDay(0);

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

  // Remind about missing streak at 20:00 GMT+7
  @Cron("0 20 * * *", {
    name: "Remind about missing streak",
    timeZone: VN_TIME_ZONE,
  })
  async remindAboutMissingStreak() {
    try {
      this.logger.log("Remind about missing streak");
      const unUpdatedStreakProfiles = await LearnerProfile.getUnUpdatedStreakProfiles();
      const streakActivities = await this.getStreakActivitiesOfWeek(unUpdatedStreakProfiles);

      for (const streakActivity of streakActivities) {
        const res = await this.novuService.sendEmail(
          { data: streakActivity },
          streakActivity.userId,
          streakActivity.email,
          REMIND_STREAK_WORKFLOW
        );

        if (res.data.acknowledged) {
          this.logger.log(`Remind ${streakActivity.username} that he/she is going to lose streak`);
        }
      }
      this.logger.log("Remind about missing streak done");
    } catch (error) {
      this.logger.error("fail to remind going to lose streak - Error: ", error);
    }
  }

  // Remind missing streak at 15:00 GMT+7
  @Cron("0 15 * * *", {
    name: "Remind missing streak",
    timeZone: VN_TIME_ZONE,
  })
  async remindMissingStreak() {
    try {
      this.logger.log("Remind missing streak");
      const missingStreakProfiles = await LearnerProfile.getMissingStreakProfiles();
      const streakActivities = await this.getStreakActivitiesOfWeek(missingStreakProfiles);

      for (const streakActivity of streakActivities) {
        const res = await this.novuService.sendEmail(
          { data: streakActivity },
          streakActivity.userId,
          streakActivity.email,
          REMIND_MISSING_STREAK_WORKFLOW
        );
        if (res.data.acknowledged) {
          this.logger.log(`Remind ${streakActivity.username} that he/she has lost streak`);
        }
      }
      this.logger.log("Remind missing streak done");
    } catch (error) {
      this.logger.error("fail to remind lost streak - Error: ", error);
    }
  }

  // Remind streak milestone at 8:00 GMT+7
  @Cron("0 8 * * *", {
    name: "Remind streak milestone",
    timeZone: VN_TIME_ZONE,
  })
  async remindStreakMileStone() {
    try {
      this.logger.log("Remind streak milestone");
      const profilesAchievedStreakMilestone = await LearnerProfile.getProfileAchiveStreakMilestone();

      const streakActivities = await this.getStreakActivitiesOfWeek(profilesAchievedStreakMilestone);
      for (const streakActivity of streakActivities) {
        const res = await this.novuService.sendEmail(
          { data: streakActivity },
          streakActivity.userId,
          streakActivity.email,
          ANNOUNCE_STREAK_MILESTONE_WORKFLOW
        );
        if (res.data.acknowledged) {
          this.logger.log(`Remind ${streakActivity.username} that he/she has achieved streak milestone`);
        }
      }
      this.logger.log("Remind streak milestone done");
    } catch (error) {}
  }

  async getStreakActivitiesOfWeek(learners: ILearnerProfile[]): Promise<IProfileStreakActivity[]> {
    const streakActivities: IProfileStreakActivity[] = [];
    const beginDate = moment().tz(VN_TIME_ZONE).startOf("week").utc(true).toDate();
    const currentDate = moment().tz(VN_TIME_ZONE).utc(true).toDate();
    for (const profile of learners) {
      const streakActivity: IActivity[] = await LearnerProfile.getDailyStreakActivities(
        profile.id,
        beginDate,
        currentDate
      );
      const account = await Account.findOne({ where: { learnerProfileId: profile.id } });
      streakActivities.push({
        userId: account.id,
        email: account.email,
        username: account.username,
        currentStreak: profile.streak.current,
        activities: LIST_DAYS.map((day) => {
          const today = moment();
          let status: string;
          if (moment().day(day).utc(true).isAfter(today)) {
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
