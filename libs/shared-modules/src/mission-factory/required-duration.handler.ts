import { LessonRecord } from "@app/database";
import { QuestHandler } from "@app/types/abstracts";
import { ILearnerProfile } from "@app/types/interfaces";
import { Logger } from "@nestjs/common";

export class RequiredDurationHandler extends QuestHandler {
  private currentTotalDuration: number;
  private readonly serviceLogger = new Logger(RequiredDurationHandler.name);

  async checkQuestCompleted(requirements: number, learner: ILearnerProfile): Promise<void> {
    try {
      this.serviceLogger.log(`duration mission with requirement: ${requirements}`);

      const timeInSecond = requirements;
      const { totalDuration } = await LessonRecord.getTotalDurationOfLearnDailyLesson(learner.id);
      this.setCompletedStatus(totalDuration >= timeInSecond);
      this.serviceLogger.log(`res: ${totalDuration}`);

      this.currentTotalDuration = totalDuration;
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  override async getUpdatedProgress(): Promise<number> {
    this.serviceLogger.log(`overide with totalDuration: ${this.currentTotalDuration}`);
    return this.currentTotalDuration;
  }
}
