import { FirebaseModule } from "@app/shared-modules/firebase";
import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationHelper } from "./notification.helper";

@Module({
  imports: [FirebaseModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationHelper],
})
export class NotificationModule {}
