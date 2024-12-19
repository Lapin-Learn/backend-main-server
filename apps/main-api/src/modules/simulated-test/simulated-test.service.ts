import { SimulatedIeltsTest, SkillTest, SkillTestSession, TestCollection } from "@app/database";
import { StartSessionDto, UpdateSessionDto } from "@app/types/dtos/simulated-tests";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { isNil } from "lodash";
import { BucketService } from "../bucket/bucket.service";

@Injectable()
export class SimulatedTestService {
  private readonly logger = new Logger(SimulatedTestService.name);
  constructor(private readonly bucketService: BucketService) {}
  async getCollectionsWithSimulatedTest(offset: number, limit: number, keyword: string, profileId: string) {
    try {
      const data = await TestCollection.getCollectionsWithTests(offset, limit, keyword, profileId);
      return Promise.all(
        data.map(async (collection) => ({
          ...collection,
          thumbnail: await this.bucketService.getPresignedDownloadUrlForAfterLoad(collection.thumbnail),
        }))
      );
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getSimulatedTestsInCollections(collectionId: number, offset: number, limit: number) {
    try {
      return SimulatedIeltsTest.getSimulatedTestInCollections(collectionId, offset, limit);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getSimulatedTestInfo(testId: number) {
    try {
      return await SimulatedIeltsTest.findOne({
        where: { id: testId },
        relations: {
          skillTests: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async startSession(learner: ICurrentUser, sessionData: StartSessionDto) {
    try {
      const currentSession = await SkillTestSession.findExistedSession(learner.profileId, sessionData);
      if (currentSession) return currentSession;

      return SkillTestSession.create({
        ...sessionData,
        learnerProfileId: learner.profileId,
      }).save();
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async updateSession(sessionId: number, sessionData: UpdateSessionDto) {
    try {
      await SkillTestSession.save({ id: sessionId, ...sessionData });
      return "Ok";
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getSkillTestContent(skillTestId: number, part: number) {
    try {
      const skillTest = await SkillTest.findOne({
        where: { id: skillTestId },
        select: {
          partsContent: true,
        },
      });

      if (isNil(skillTest) || isNil(skillTest.partsContent)) throw new BadRequestException("Test data doesn't existed");
      if (skillTest.partsContent.length < part) throw new BadRequestException(`Test doesn't have part ${part}`);
      return skillTest.partsContent[part - 1];
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
