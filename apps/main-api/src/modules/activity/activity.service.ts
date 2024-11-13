import { Activity } from "@app/database";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(this.constructor.name);
  async createNewActivity(profileId: string, actionIds: number[]): Promise<void> {
    try {
      const activities = actionIds.map((actionId) => Activity.create({ profileId, actionId }));
      await Activity.save(activities);
      return;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
