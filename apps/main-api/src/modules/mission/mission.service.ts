import { Mission, ProfileMissionProgress } from "@app/database";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { MissionHelper } from "./mission.helper";

@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(private readonly missionHelper: MissionHelper) {}

  async getMissions(user: ICurrentUser) {
    try {
      const missions = await Mission.find();
      const missionProgress = await ProfileMissionProgress.getMissions(user.profileId);
      return this.missionHelper.buildMissionsResponseData(missionProgress, missions);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
