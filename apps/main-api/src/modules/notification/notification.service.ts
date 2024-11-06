import { LearnerProfile, NotificationToken } from "@app/database";
import { FirebaseMessagingService } from "@app/shared-modules/firebase";
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { NotificationHelper } from "./notification.helper";
import { VN_TIME_ZONE } from "@app/types/constants";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly notificationHelper = new NotificationHelper();

  constructor(private readonly firebaseMessagingService: FirebaseMessagingService) {}

  async upsertAccountToken(accountId: string, token: string) {
    // Save token to database
    try {
      const account = await NotificationToken.findOne({ where: { accountId } });
      if (account) {
        await NotificationToken.save({ ...account, token });
      } else {
        await NotificationToken.save({ accountId, token });
      }
      return "OK";
    } catch (e) {
      this.logger.error(e);
    }
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

  @Cron("00 21 * * *", {
    name: "Remind learning everyday",
    timeZone: VN_TIME_ZONE,
  }) // 9PM every day
  // @Cron("*/2 * * * *") // Every 2 minutes, just for testing
  async sendRemindStreakNotification() {
    try {
      const profiles = await LearnerProfile.getNotCompleteStreakProfiles();
      const profileIds = profiles.map((profile) => profile.id);
      const notifications = await NotificationToken.getTokensByLearnerProfileIds(profileIds);
      const tokens = notifications.map((n) =>
        this.notificationHelper.buildStreakReminderNotificationData(n.token, n.account.learnerProfile.streak.current)
      );
      const result = await this.sendNotificationToTokens(tokens);
      return result;
    } catch (e) {
      this.logger.error(e);
    }
  }
}
