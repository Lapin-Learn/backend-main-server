import { NotificationToken } from "@app/database";
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { NOTIFICATION_CRON_JOB, OK_RESPONSE, REMIND_STREAK_NOTIFICATION_JOB, VN_TIME_ZONE } from "@app/types/constants";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(@InjectQueue(NOTIFICATION_CRON_JOB) private readonly notificationQueue: Queue) {}

  async upsertAccountToken(accountId: string, token: string) {
    // Save token to database
    try {
      const account = await NotificationToken.findOne({ where: { accountId } });
      if (account) {
        await NotificationToken.save({ ...account, token });
      } else {
        await NotificationToken.save({ accountId, token });
      }
      return OK_RESPONSE;
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
    await this.notificationQueue.add(REMIND_STREAK_NOTIFICATION_JOB, {});
  }
}
