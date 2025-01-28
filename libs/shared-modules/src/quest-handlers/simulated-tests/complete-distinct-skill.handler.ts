import { SkillTestSession } from "@app/database";
import { ILearnerProfile } from "@app/types/interfaces";
import { SimulatedTestQuestHandler } from "./simulated-test.handler";
import { Logger } from "@nestjs/common";

export class CompleteDistinctedSkillsHandler extends SimulatedTestQuestHandler {
  private currentDistinctSkills: number = 0;
  private readonly serviceLogger = new Logger(CompleteDistinctedSkillsHandler.name);

  constructor() {
    super();
  }

  async checkQuestCompleted(_: number, learner: ILearnerProfile): Promise<void> {
    try {
      const sessions = await SkillTestSession.getDistinctSkillSessions(learner.id);
      const filtered = this.filterSessions(sessions);
      this.currentDistinctSkills = filtered.length;
      this.setCompletedStatus(filtered.length > 0);
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  override async getUpdatedProgress(): Promise<number> {
    return this.currentDistinctSkills;
  }
}
