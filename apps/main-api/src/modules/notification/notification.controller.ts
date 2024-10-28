import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ICurrentUser } from "@app/types/interfaces";
import { CurrentUser } from "../../decorators";
import { NotificationService } from "./notification.service";
import { FcmTokenDto } from "@app/types/dtos";

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Post("fcm-token")
  async upsertAccountToken(@CurrentUser() user: ICurrentUser, @Body() data: FcmTokenDto) {
    return this.notificationService.upsertAccountToken(user.userId, data.token);
  }
}
