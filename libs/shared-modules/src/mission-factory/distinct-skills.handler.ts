import { LessonRecord } from "@app/database";
import { QuestHandler } from "@app/types/abstracts";
import { ILearnerProfile } from "@app/types/interfaces";
import { Logger } from "@nestjs/common";

export class DistinctSkillsHandler extends QuestHandler {
  private currentDistinctSkills: number;
  private readonly serviceLogger = new Logger(DistinctSkillsHandler.name);

  async checkQuestCompleted(requirements: number, learner: ILearnerProfile): Promise<void> {
    try {
      this.serviceLogger.log(`distinct mission with requirement: ${requirements}`);

      const distinctSkills = requirements;
      const res = await LessonRecord.getCompletedLessonDistinctSkills(learner.id);
      this.serviceLogger.log("res: ", res.distinctSkills);

      this.currentDistinctSkills = res.distinctSkills;
      this.setCompletedStatus(res.distinctSkills >= distinctSkills);
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  override async getUpdatedProgress(): Promise<number> {
    return this.currentDistinctSkills;
  }
}
