import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiBearerAuth, ApiTags, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { ICurrentUser } from "@app/types/interfaces";
import { ApiDefaultResponses, CurrentUser } from "../../decorators";
import { NotificationService } from "./notification.service";
import { FcmTokenDto } from "@app/types/dtos";

@ApiTags("Notifications")
@ApiBearerAuth()
@ApiDefaultResponses()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @ApiOperation({ summary: "Upsert FCM token for the account" })
  @ApiOkResponse({
    type: String,
  })
  @Post("fcm-token")
  async upsertAccountToken(@CurrentUser() user: ICurrentUser, @Body() data: FcmTokenDto) {
    return this.notificationService.upsertAccountToken(user.userId, data.token);
  }
}
