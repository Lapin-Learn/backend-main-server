import { SkillTestSession } from "@app/database";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { SkillEnum } from "@app/types/enums";
import { OK_RESPONSE } from "@app/types/constants";

@Injectable()
export class SessionService {
  private readonly logger = new Logger(this.constructor.name);
  constructor() {}

  async getLatestInprogressSession(learner: ICurrentUser, skill?: SkillEnum, collectionId?: number) {
    try {
      const data = await SkillTestSession.getLatestInprogressSessionWithFilter(learner.profileId, skill, collectionId);
      if (!data) return OK_RESPONSE;
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
