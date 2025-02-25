import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { App, AppOptions, cert } from "firebase-admin/app";

import { FirebaseAuthService } from "./firebase-auth.service";
import { FirebaseMessagingService } from "./firebase-messaging.service";
import { initializeApp } from "firebase-admin/app";
import { FIREBASE_APP_PROVIDER } from "@app/types/constants";

@Module({
  providers: [
    {
      provide: FIREBASE_APP_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): App => {
        const options: AppOptions = {
          credential: cert({
            projectId: configService.get("FIREBASE_ADMIN_PROJECT_ID"),
            privateKey: configService.get("FIREBASE_ADMIN_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
            clientEmail: configService.get("FIREBASE_ADMIN_CLIENT_EMAIL"),
          }),
        };
        return initializeApp(options);
      },
    },
    FirebaseAuthService,
    FirebaseMessagingService,
  ],
  exports: [FirebaseAuthService, FirebaseMessagingService],
})
export class FirebaseModule {}
