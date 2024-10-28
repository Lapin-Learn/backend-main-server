import { NotificationToken } from "@app/database";
import { FirebaseMessagingService } from "@app/shared-modules/firebase";
import { Injectable, Logger } from "@nestjs/common";
import { In } from "typeorm";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

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

  async sendScheduleNotificationToAccounts(
    accountIds: string[],
    title: string,
    body: string,
    topic?: string,
    data?: { [key: string]: string }
  ) {
    try {
      const tokens = await NotificationToken.find({ where: { accountId: In(accountIds) } });
      const deviceTokens = tokens.map((t) => ({ token: t.token, id: t.id, accountId: t.accountId }));

      const notificationPromises = deviceTokens.map((token) =>
        this.firebaseMessagingService.pushNotification(token.token, topic, { title, body }, data)
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
