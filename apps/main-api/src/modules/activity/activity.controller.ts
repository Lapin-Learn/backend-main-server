import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ActivityService } from "./activity.service";
import { FirebaseJwtAuthGuard } from "../../guards";
import { CurrentUser } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";

@Controller("activities")
@UseGuards(FirebaseJwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}
  @Post()
  createActivity(@CurrentUser() user: ICurrentUser, @Body() data: { actionIds: number[] }) {
    return this.activityService.createNewActivity(user.profileId, data.actionIds);
  }
}
