import { LearnerProfile, LessonRecord } from "@app/database";
import { QuestHandler } from "@app/types/abstracts";
import { Logger } from "@nestjs/common";
import moment from "moment-timezone";
import { Between } from "typeorm";

export class ExceedLearningStreak extends QuestHandler {
  private learner: LearnerProfile;
  private readonly serviceLogger = new Logger(ExceedLearningStreak.name);

  async checkQuestCompleted(requirements: number, learner: LearnerProfile): Promise<void> {
    try {
      const requiredStreaks = requirements; // should be  1
      const today = moment().tz("Asia/Ho_Chi_Minh").startOf("day").toDate();
      const res = await LessonRecord.find({
        where: { learnerProfileId: learner.id, createdAt: Between(today, moment(today).endOf("day").toDate()) },
      });

      this.setCompletedStatus(res.length === requiredStreaks);
      this.learner = learner;
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  override async getUpdatedProgress(): Promise<number> {
    try {
      const consecutive = await LessonRecord.countMaxConsecutiveLearningLessonDate(this.learner.id);
      return consecutive;
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }
}
