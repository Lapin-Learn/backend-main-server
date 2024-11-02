import { Injectable, Logger } from "@nestjs/common";
import { messaging } from "firebase-admin";

@Injectable()
export class FirebaseMessagingService {
  private readonly logger = new Logger(this.constructor.name);

  pushNotification(
    token: string,
    topic?: string,
    message?: { title: string; body: string },
    data?: { [key: string]: string }
  ) {
    try {
      return messaging().send({
        notification: message,
        token,
        data,
        topic,
      });
    } catch (error) {
      this.logger.error(error);
      throw new Error("Unable to send notification");
    }
  }
}
