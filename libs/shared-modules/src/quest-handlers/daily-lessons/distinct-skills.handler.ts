import { Injectable } from "@nestjs/common";
import { LessonRecord } from "@app/database";
import { QuestHandler } from "@app/types/abstracts";
import { ILearnerProfile } from "@app/types/interfaces";
import { Logger } from "@nestjs/common";

@Injectable()
export class DistinctSkillsHandler extends QuestHandler {
  private currentDistinctSkills: number;
  private readonly serviceLogger = new Logger(DistinctSkillsHandler.name);

  async checkQuestCompleted(_: number, learner: ILearnerProfile): Promise<void> {
    try {
      const res = await LessonRecord.getCompletedLessonDistinctSkills(learner.id);
      this.currentDistinctSkills = res.distinctSkills;
      this.setCompletedStatus(res.distinctSkills > 0);
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  override async getUpdatedProgress(): Promise<number> {
    return this.currentDistinctSkills;
  }
}
