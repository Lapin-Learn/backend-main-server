import { Injectable } from "@nestjs/common";
import { LessonRecord } from "@app/database";
import { QuestHandler } from "@app/types/abstracts";
import { ILearnerProfile } from "@app/types/interfaces";
import { Logger } from "@nestjs/common";

@Injectable()
export class RequiredDurationHandler extends QuestHandler {
  private currentTotalDuration: number;
  private readonly serviceLogger = new Logger(RequiredDurationHandler.name);

  async checkQuestCompleted(_: number, learner: ILearnerProfile): Promise<void> {
    try {
      const { totalDuration } = await LessonRecord.getTotalDurationOfLearnDailyLesson(learner.id);
      this.currentTotalDuration = totalDuration;
      this.setCompletedStatus(totalDuration > 0);
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  override async getUpdatedProgress(): Promise<number> {
    return this.currentTotalDuration;
  }
}
