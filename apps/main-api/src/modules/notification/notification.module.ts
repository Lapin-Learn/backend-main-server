import { FirebaseModule } from "@app/shared-modules/firebase";
import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";

@Module({
  imports: [FirebaseModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
