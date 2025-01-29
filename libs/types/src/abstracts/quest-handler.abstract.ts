import { ILearnerProfile } from "../interfaces";

export abstract class QuestHandler {
  private isCompleted: boolean = false;

  getCompletedStatus() {
    return this.isCompleted;
  }

  setCompletedStatus(status: boolean) {
    this.isCompleted = status;
  }

  async getUpdatedProgress(currentProgress: number): Promise<number> {
    if (this.isCompleted) {
      currentProgress++;
    }
    return currentProgress;
  }

  abstract checkQuestCompleted(requirements: number, learner: ILearnerProfile): Promise<void>;
  // abstract getCategoryName(): MissionCategoryNameEnum;
}
