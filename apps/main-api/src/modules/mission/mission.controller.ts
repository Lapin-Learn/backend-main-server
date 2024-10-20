import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FirebaseJwtAuthGuard } from "../../guards";
import { MissionService } from "./mission.service";
import { CurrentUser, Roles } from "../../decorators";
import { AccountRoleEnum } from "@app/types/enums";
import { ICurrentUser } from "@app/types/interfaces";

@ApiTags("Missions")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@ApiResponse({ status: 200, description: "Missions retrieved successfully" })
@ApiResponse({ status: 400, description: "Bad request" })
@ApiResponse({ status: 401, description: "Unauthorized" })
@ApiResponse({ status: 403, description: "Forbidden" })
@ApiResponse({ status: 500, description: "Internal server error" })
@Controller("missions")
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @ApiOperation({ summary: "Get missions" })
  @Get()
  @Roles(AccountRoleEnum.LEARNER)
  async getMissions(@CurrentUser() user: ICurrentUser) {
    return this.missionService.getMissions(user);
  }

  @ApiOperation({ summary: "Receive reward from mission" })
  @Post("receive")
  @Roles(AccountRoleEnum.LEARNER)
  async receiveRewards(@CurrentUser() user: ICurrentUser) {
    return this.missionService.receiveRewards(user);
  }
}
