import { SkillTestSession } from "@app/database";
import { ILearnerProfile } from "@app/types/interfaces";
import { SimulatedTestQuestHandler } from "./simulated-test.handler";
import { Logger } from "@nestjs/common";
import { MissionCategoryNameEnum } from "@app/types/enums";

export class CompleteDistinctedSkillsHandler extends SimulatedTestQuestHandler {
  private readonly serviceLogger = new Logger(CompleteDistinctedSkillsHandler.name);
  private readonly category = MissionCategoryNameEnum.COMPLETE_LESSON_WITH_DIFFERENT_SKILLS;
  private currentDistinctedSkills: number = 0;

  constructor() {
    super();
  }

  async checkQuestCompleted(_: number, learner: ILearnerProfile): Promise<void> {
    try {
      const sessions = await SkillTestSession.getDistinctSkillNameSessions(learner.id);
      const filtered = this.filterSessions(sessions);
      this.currentDistinctedSkills = filtered.length;
      this.setCompletedStatus(filtered.length > 0);
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  override async getUpdatedProgress(): Promise<number> {
    return this.currentDistinctedSkills;
  }

  getCategoryName(): MissionCategoryNameEnum {
    return this.category;
  }
}
