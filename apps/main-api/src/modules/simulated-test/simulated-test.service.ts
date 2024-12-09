import { TestCollection } from "@app/database";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class SimulatedTestService {
  private readonly logger = new Logger(SimulatedTestService.name);
  async getCollectionsWithSimulatedTest(offset: number, limit: number, keyword: string) {
    try {
      return TestCollection.getCollectionsWithTests(offset, limit, keyword);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException("Something went wrong");
    }
  }
}
