import { SimulatedIeltsTest, TestCollection } from "@app/database";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";

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
}
