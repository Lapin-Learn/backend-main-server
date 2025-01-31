import { Injectable } from "@nestjs/common";
import { SkillTestSession } from "@app/database";
import { SimulatedTestQuestHandler } from "./simulated-test.handler";
import { ILearnerProfile } from "@app/types/interfaces";
import { Logger } from "@nestjs/common";

@Injectable()
export class CompleteDistinctSkillTestsHandler extends SimulatedTestQuestHandler {
  private currentDistinctSkillTests: number = 0;
  private readonly serviceLogger = new Logger(CompleteDistinctSkillTestsHandler.name);

  constructor() {
    super();
  }

  async checkQuestCompleted(_: number, learner: ILearnerProfile): Promise<void> {
    try {
      const sessions = await SkillTestSession.getDistinctSkillTestIdSessions(learner.id);
      const filtered = this.filterSessions(sessions);
      this.currentDistinctSkillTests = filtered.length;
      this.setCompletedStatus(filtered.length > 0);
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  override async getUpdatedProgress(): Promise<number> {
    return this.currentDistinctSkillTests;
  }
}
