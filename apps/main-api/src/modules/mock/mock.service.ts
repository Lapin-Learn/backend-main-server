import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ActivityService } from "../activity/activity.service";
import { MockHelper } from "./mock.helper";

@Injectable()
export class MockService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly activityService: ActivityService,
    private readonly mockHelper: MockHelper
  ) {}

  async mockFinishedDailyLesson(userId: string, lessonId: string) {
    try {
      const { learnerProfile } = await this.mockHelper.checkUserExist(userId);

      // Get lesson action data

      await this.activityService.createNewActivity(learnerProfile.id, []);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async mockCompleteBadge(userId: string, badgeId: string) {
    try {
      const { learnerProfile } = await this.mockHelper.checkUserExist(userId);

      // Get badge action data

      await this.activityService.createNewActivity(learnerProfile.id, []);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async mockMissionReward(userId: string, missionId: string) {
    try {
      const { learnerProfile } = await this.mockHelper.checkUserExist(userId);

      // Get mission action data

      await this.activityService.createNewActivity(learnerProfile.id, []);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
