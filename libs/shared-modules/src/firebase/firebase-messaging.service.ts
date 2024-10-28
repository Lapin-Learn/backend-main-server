import { Inject, Injectable, Logger } from "@nestjs/common";
import { AxiosInstance } from "axios";
import { AppOptions, messaging } from "firebase-admin";
import { App, getApp, getApps, initializeApp } from "firebase-admin/app";

@Injectable()
export class FirebaseMessagingService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly app: App;
  private readonly apiKey: string;
  private readonly firebaseUrl: string;
  private readonly requestUri: string;
  private readonly httpService: AxiosInstance;

  constructor(@Inject("FIREBASE_ADMIN_OPTIONS_TOKEN") readonly options: AppOptions) {
    // Check if the default app is already initialized
    if (!getApps().length) {
      this.app = initializeApp(options);
    } else {
      this.app = getApp();
    }
  }

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
      console.log(error);
      throw new Error("Unable to send notification");
    }
  }
}
