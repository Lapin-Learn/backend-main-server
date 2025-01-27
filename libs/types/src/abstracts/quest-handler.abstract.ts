import { Logger } from "@nestjs/common";
import { ILearnerProfile } from "../interfaces";

export abstract class QuestHandler {
  private isCompleted: boolean = false;
  private readonly logger = new Logger(QuestHandler.name);

  getCompletedStatus() {
    return this.isCompleted;
  }

  setCompletedStatus(status: boolean) {
    this.isCompleted = status;
  }

  async getUpdatedProgress(currentProgress: number): Promise<number> {
    this.logger.log(`Update currentProgress: ${currentProgress}`);
    if (this.isCompleted) {
      currentProgress++;
    }
    return currentProgress;
  }

  abstract checkQuestCompleted(requirements: number, learner: ILearnerProfile): Promise<void>;
}
