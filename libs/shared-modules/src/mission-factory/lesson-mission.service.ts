import { MissionServiceAbstract } from "@app/types/abstracts";
import { LessonRecord } from "@app/database";
import { MissionCategoryNameEnum } from "@app/types/enums";
import { ILearnerProfile, IMission } from "@app/types/interfaces";
import { Logger } from "@nestjs/common";
import moment from "moment-timezone";
import { Between } from "typeorm";

export class LessonMission extends MissionServiceAbstract {
  private readonly logger = new Logger(this.constructor.name);
  private readonly _missionCategoryName: MissionCategoryNameEnum;
  private readonly _mission: IMission;
  private readonly _learner: ILearnerProfile;

  constructor(missionCategoryName: MissionCategoryNameEnum, mission: IMission, learner: ILearnerProfile) {
    super();
    this._missionCategoryName = missionCategoryName;
    this._learner = learner;
    this._mission = mission;
  }

  async isMissionCompleted(): Promise<boolean> {
    switch (this._missionCategoryName) {
      case MissionCategoryNameEnum.COMPLETE_LESSON_WITH_PERCENTAGE_SCORE:
        return this.completeLessonWithPercentageScore();
      case MissionCategoryNameEnum.TOTAL_DURATION_OF_LEARN_DAILY_LESSON:
        return this.learnDailyLessonWithEnoughDuration();
      case MissionCategoryNameEnum.COMPLETE_LESSON_WITH_DIFFERENT_SKILLS:
        return this.completeDailyLessonWithDifferentSkills();
    }
  }

  async completeLessonWithPercentageScore(): Promise<boolean> {
    try {
      const percentage = this._mission.quest.requirements;
      const startDate = moment().startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();
      const latestLessonRecord = await LessonRecord.find({
        where: { learnerProfileId: this._learner.id, createdAt: Between(startDate, endDate) },
        order: { createdAt: "DESC" },
        take: 1,
      });

      if (latestLessonRecord.length === 0) {
        return false;
      }
      const { correctAnswers, wrongAnswers } = latestLessonRecord[0];
      return (correctAnswers / (correctAnswers + wrongAnswers)) * 100.0 >= percentage;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async learnDailyLessonWithEnoughDuration(): Promise<boolean> {
    try {
      const timeInSecond = this._mission.quest.requirements;
      const { totalDuration } = await LessonRecord.getTotalDurationOfLearnDailyLesson(this._learner.id);
      return totalDuration >= timeInSecond;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async completeDailyLessonWithDifferentSkills(): Promise<boolean> {
    const distinctSkills = this._mission.quest.requirements;
    const res = await LessonRecord.getCompletedLessonDistinctSkills(this._learner.id);
    return res.distinctSkills >= distinctSkills;
  }
}
