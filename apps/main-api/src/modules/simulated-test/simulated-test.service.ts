import { TestCollection } from "@app/database";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { plainToClass } from "class-transformer";

@Injectable()
export class SimulatedTestService {
  private readonly logger = new Logger(SimulatedTestService.name);
  async getCollectionsWithSimulatedTest(offset: number, limit: number) {
    try {
      const collections = await TestCollection.getCollectionsWithTests(offset, limit);
      return collections.map((c) => plainToClass(TestCollection, c));
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException("Something went wrong");
    }
  }
}
