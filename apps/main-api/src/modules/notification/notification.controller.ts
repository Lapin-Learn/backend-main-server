import { Body, Controller, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiBearerAuth, ApiTags, ApiResponse } from "@nestjs/swagger";
import { ICurrentUser } from "@app/types/interfaces";
import { CurrentUser } from "../../decorators";
import { NotificationService } from "./notification.service";
import { FcmTokenDto } from "@app/types/dtos";

@ApiTags("Notifications")
@ApiBearerAuth()
@ApiResponse({ status: 200, description: "Successfully" })
@ApiResponse({ status: 400, description: "Bad request" })
@ApiResponse({ status: 401, description: "Unauthorized" })
@ApiResponse({ status: 403, description: "Forbidden" })
@ApiResponse({ status: 500, description: "Internal server error" })
@UseGuards(FirebaseJwtAuthGuard)
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Post("fcm-token")
  @ApiResponse({
    status: HttpStatus.OK,
    type: String,
  })
  async upsertAccountToken(@CurrentUser() user: ICurrentUser, @Body() data: FcmTokenDto) {
    return this.notificationService.upsertAccountToken(user.userId, data.token);
  }
}
