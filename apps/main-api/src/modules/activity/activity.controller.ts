import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ActivityService } from "./activity.service";
import { FirebaseJwtAuthGuard } from "../../guards";
import { CurrentUser } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateActivityDto } from "@app/types/dtos/activities/create-activity.dto";

@ApiTags("Activities")
@Controller("activities")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@ApiResponse({ status: 400, description: "Bad request" })
@ApiResponse({ status: 401, description: "Unauthorized" })
@ApiResponse({ status: 403, description: "Forbidden" })
@ApiResponse({ status: 500, description: "Internal server error" })
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @ApiOperation({ summary: "Create a new activity" })
  @ApiBody({ type: CreateActivityDto })
  @ApiResponse({ status: 201, description: "Activity created" })
  @Post()
  createActivity(@CurrentUser() user: ICurrentUser, @Body() data: CreateActivityDto) {
    return this.activityService.createNewActivity(user.profileId, data.actionIds);
  }
}
