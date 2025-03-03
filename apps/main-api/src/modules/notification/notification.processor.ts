import { NOTIFICATION_CRON_JOB, REMIND_STREAK_NOTIFICATION_JOB } from "@app/types/constants";
import { WorkerHost, Processor } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { NotificationHelper } from "./notification.helper";
import { Job } from "bullmq";
import { FirebaseMessagingService } from "@app/shared-modules/firebase";
import { LearnerProfile, NotificationToken } from "@app/database";

@Processor(NOTIFICATION_CRON_JOB)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);
  constructor(
    private readonly notificationHelper: NotificationHelper,
    private readonly firebaseMessagingService: FirebaseMessagingService
  ) {
    super();
  }

  async process(job: Job) {
    try {
      if (job.name === REMIND_STREAK_NOTIFICATION_JOB) return this.sendRemindStreakNotification();
    } catch (err) {
      this.logger.error(`Fail ${job.name} job: `, err);
      throw err;
    }
  }

  private async sendRemindStreakNotification() {
    this.logger.log("Remind notification");
    const profiles = await LearnerProfile.getNotCompleteStreakProfiles();
    const profileIds = profiles.map((profile) => profile.id);
    const notifications = await NotificationToken.getTokensByLearnerProfileIds(profileIds);
    const tokens = notifications.map((n) =>
      this.notificationHelper.buildStreakReminderNotificationData(n.token, n.account.learnerProfile.streak.current)
    );
    const result = await this.sendNotificationToTokens(tokens);
    return result;
  }

  private async sendNotificationToTokens(
    notifications: {
      fcmToken: string;
      title: string;
      body: string;
      data?: { [key: string]: string };
    }[],
    topic?: string
  ) {
    try {
      const notificationPromises = notifications.map(({ fcmToken, title, body, data }) =>
        this.firebaseMessagingService.pushNotification(fcmToken, topic, { title, body }, data)
      );

      const results = await Promise.allSettled(notificationPromises);
      // Push notifications for advertising, reminding purposes, so we don't store to database
      return {
        success: results.filter((p) => p.status === "fulfilled").length,
        failed: results.filter((p) => p.status === "rejected").length,
      };
    } catch (e) {
      this.logger.error(e);
    }
  }
}
