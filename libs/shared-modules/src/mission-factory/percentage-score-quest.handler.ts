import { LessonRecord } from "@app/database";
import { QuestHandler } from "@app/types/abstracts";
import { ILearnerProfile } from "@app/types/interfaces";
import { Logger } from "@nestjs/common";
import moment from "moment-timezone";
import { Between } from "typeorm";

export class PercentageScoreHandler extends QuestHandler {
  private readonly serviceLogger = new Logger(PercentageScoreHandler.name);
  async checkQuestCompleted(requirements: number, learner: ILearnerProfile): Promise<void> {
    try {
      const percentage = requirements;
      const startDate = moment().startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();
      const latestLessonRecord = await LessonRecord.find({
        where: { learnerProfileId: learner.id, createdAt: Between(startDate, endDate) },
        order: { createdAt: "DESC" },
        take: 1,
      });

      if (latestLessonRecord.length === 0) {
        this.setCompletedStatus(false);
      }
      const { correctAnswers, wrongAnswers } = latestLessonRecord[0];
      this.setCompletedStatus((correctAnswers / (correctAnswers + wrongAnswers)) * 100.0 >= percentage);
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }
}
