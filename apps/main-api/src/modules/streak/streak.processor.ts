import { Account, LearnerProfile, Streak } from "@app/database";
import { NovuService } from "@app/shared-modules/novu";
import {
  ANNOUNCE_STREAK_MILESTONE_WORKFLOW,
  LIST_DAYS,
  REMIND_MISSING_STREAK_WORKFLOW,
  REMIND_STREAK_WORKFLOW,
  STREAK_CRON_JOB,
  VN_TIME_ZONE,
} from "@app/types/constants";
import {
  REMIND_ABOUT_MISSING_STREAK_JOB,
  REMIND_MISSING_STREAK_JOB,
  REMIND_STREAK_MILESTONE_JOB,
  RESET_STREAK_JOB,
} from "@app/types/constants/name-job.constant";
import { IActivity, ILearnerProfile, IProfileStreakActivity } from "@app/types/interfaces";
import { DayLabelMap } from "@app/utils/maps";
import { WorkerHost, Processor } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import moment from "moment-timezone";
import { In } from "typeorm";

@Processor(STREAK_CRON_JOB, {
  concurrency: 1,
})
export class StreakProcessor extends WorkerHost {
  private readonly logger = new Logger(StreakProcessor.name);
  constructor(private readonly novuService: NovuService) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      const { name } = job;
      switch (name) {
        case RESET_STREAK_JOB:
          return this.resetStreakJob();
        case REMIND_ABOUT_MISSING_STREAK_JOB:
          return this.remindAboutMissingStreakJob();
        case REMIND_MISSING_STREAK_JOB:
          return this.remindMissingStreakJob();
        case REMIND_STREAK_MILESTONE_JOB:
          return this.remindStreakMileStoneJob();
      }
    } catch (err) {
      this.logger.error(`Fail ${job.name} job: `, err);
      throw err;
    }
  }

  private async resetStreakJob() {
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

    return { shouldResetProfiles, shouldUnextendProfiles };
  }

  private async remindAboutMissingStreakJob() {
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
    return streakActivities;
  }

  private async remindMissingStreakJob() {
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
    return streakActivities;
  }

  private async remindStreakMileStoneJob() {
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
    return streakActivities;
  }

  private async getStreakActivitiesOfWeek(learners: ILearnerProfile[]): Promise<IProfileStreakActivity[]> {
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
