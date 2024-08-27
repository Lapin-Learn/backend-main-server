import { Controller, Param, Put, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard } from "../../guards";
import { CurrentUser } from "../../decorators";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MockService } from "./mock.service";
import { ICurrentUser } from "@app/types/interfaces";

@ApiTags("Mock")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("mock")
export class MockController {
  constructor(private mockService: MockService) {}

  @Put("lessons/:id")
  @ApiOperation({ summary: "Mocking user finished a daily lesson" })
  @ApiResponse({ status: 200, description: "Mocked successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async mockFinishedDailyLesson(@CurrentUser() user: ICurrentUser, @Param("id") lessonId: string) {
    return this.mockService.mockFinishedDailyLesson(user.userId, lessonId);
  }

  @Put("badges/:id")
  @ApiOperation({ summary: "Mocking user complete a badge" })
  @ApiResponse({ status: 200, description: "Mocked successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async mockCompleteBadge(@CurrentUser() user: ICurrentUser, @Param("id") badgeId: string) {
    return this.mockService.mockCompleteBadge(user.userId, badgeId);
  }

  @Put("missions/:id/reward")
  @ApiOperation({ summary: "Receive a reward from a mission" })
  @ApiResponse({ status: 200, description: "Mocked successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async mockMissionReward(@CurrentUser() user: ICurrentUser, @Param("id") missionId: string) {
    return this.mockService.mockMissionReward(user.userId, missionId);
  }
}
