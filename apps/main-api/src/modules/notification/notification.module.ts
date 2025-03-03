import { FirebaseModule } from "@app/shared-modules/firebase";
import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationHelper } from "./notification.helper";
import { BullModule } from "@nestjs/bullmq";
import { NOTIFICATION_CRON_JOB } from "@app/types/constants";
import { NotificationProcessor } from "./notification.processor";

@Module({
  imports: [
    FirebaseModule,
    BullModule.registerQueue({
      name: NOTIFICATION_CRON_JOB,
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationHelper, NotificationProcessor],
})
export class NotificationModule {}
