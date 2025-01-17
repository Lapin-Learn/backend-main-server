import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { App, AppOptions, cert } from "firebase-admin/app";

import { FirebaseAuthService } from "./firebase-auth.service";
import { FirebaseMessagingService } from "./firebase-messaging.service";
import { FirebaseStorageService } from "./firebase-storage.service";
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
            privateKey: configService.get("FIREBASE_ADMIN_PRIVATE_KEY"),
            clientEmail: configService.get("FIREBASE_ADMIN_CLIENT_EMAIL"),
          }),
          storageBucket: configService.get("FIREBASE_ADMIN_STORAGE"),
        };
        return initializeApp(options);
      },
    },
    FirebaseAuthService,
    FirebaseMessagingService,
    FirebaseStorageService,
  ],
  exports: [FirebaseAuthService, FirebaseMessagingService, FirebaseStorageService],
})
export class FirebaseModule {}
