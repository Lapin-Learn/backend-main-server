import { ProfileMission } from "@app/database";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { MissionHelper } from "./mission.helper";

@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(private readonly missionHelper: MissionHelper) {}

  async getMissions(user: ICurrentUser) {
    try {
      const data = await ProfileMission.getMissions(user.profileId);
      return this.missionHelper.buildMissionsResponseData(data);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
