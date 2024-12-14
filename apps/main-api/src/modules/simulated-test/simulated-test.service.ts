import { SimulatedIeltsTest, SkillTest, SkillTestSession, TestCollection } from "@app/database";
import { StartSessionDto } from "@app/types/dtos/simulated-tests";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { isNil } from "lodash";

@Injectable()
export class SimulatedTestService {
  private readonly logger = new Logger(SimulatedTestService.name);
  async getCollectionsWithSimulatedTest(offset: number, limit: number, keyword: string) {
    try {
      return TestCollection.getCollectionsWithTests(offset, limit, keyword);
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

  async startNewSession(learner: ICurrentUser, sessionData: StartSessionDto) {
    try {
      await SkillTestSession.create({
        ...sessionData,
        learnerProfileId: learner.profileId,
      }).save();
      return "OK";
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
