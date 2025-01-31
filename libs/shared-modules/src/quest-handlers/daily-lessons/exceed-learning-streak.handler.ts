import { Injectable } from "@nestjs/common";
import { LearnerProfile, LessonRecord } from "@app/database";
import { QuestHandler } from "@app/types/abstracts";
import { VN_TIME_ZONE } from "@app/types/constants";
import { Logger } from "@nestjs/common";
import moment from "moment-timezone";
import { Between } from "typeorm";

@Injectable()
export class ExceedLearningStreak extends QuestHandler {
  private learner: LearnerProfile;
  private readonly serviceLogger = new Logger(ExceedLearningStreak.name);
  private readonly allowedBroken: boolean;

  constructor(allowedBroken: boolean) {
    super();
    this.allowedBroken = allowedBroken;
  }

  async checkQuestCompleted(requirements: number, learner: LearnerProfile): Promise<void> {
    try {
      const requiredStreaks = requirements; // should be  1
      const today = moment().tz(VN_TIME_ZONE).startOf("day").toDate();
      const res = await LessonRecord.find({
        where: { learnerProfileId: learner.id, createdAt: Between(today, moment(today).endOf("day").toDate()) },
      });

      this.setCompletedStatus(res.length >= requiredStreaks);
      this.learner = learner;
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  override async getUpdatedProgress(): Promise<number> {
    try {
      const consecutive = this.allowedBroken
        ? await LessonRecord.countDistinctLearningDaysThisMonth(this.learner.id)
        : await LessonRecord.countMaxConsecutiveLearningLessonDate(this.learner.id);
      return consecutive;
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }
}
