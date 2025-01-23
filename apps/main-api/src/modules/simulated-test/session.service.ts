import { SkillTestSession } from "@app/database";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { SkillEnum } from "@app/types/enums";
import { OK_RESPONSE } from "@app/types/constants";
import { LatestInprogressSessionDto } from "@app/types/response-dtos";

@Injectable()
export class SessionService {
  private readonly logger = new Logger(this.constructor.name);
  constructor() {}

  async getLatestInprogressSession(
    learner: ICurrentUser,
    skill?: SkillEnum,
    collectionId?: number
  ): Promise<string | LatestInprogressSessionDto> {
    try {
      const data = await SkillTestSession.getLatestInprogressSessionWithFilter(learner.profileId, skill, collectionId);
      if (!data) return OK_RESPONSE;
      return {
        sessionId: data.id,
        mode: data.mode,
        status: data.status,
        parts: data.parts,
        skillTestId: data.skillTestId,
        skill: data.skillTest.skill,
        testName: data.skillTest.simulatedIeltsTest.testName,
        testCollectionName: data.skillTest.simulatedIeltsTest.testCollection.name,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
