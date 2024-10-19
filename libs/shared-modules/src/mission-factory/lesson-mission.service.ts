import { MissionServiceAbstract } from "@app/types/abstracts";
import { LessonRecord } from "@app/database";
import { MissionCategoryNameEnum } from "@app/types/enums";
import { ILearnerProfile } from "@app/types/interfaces";
import { Logger } from "@nestjs/common";

export class LessonMission extends MissionServiceAbstract {
  private readonly logger = new Logger(this.constructor.name);
  private readonly _missionCategoryName: MissionCategoryNameEnum;
  private readonly _requirements: number;
  private readonly _learner: ILearnerProfile;

  constructor(missionCategoryName: MissionCategoryNameEnum, requirements: number, learner: ILearnerProfile) {
    super();
    this._missionCategoryName = missionCategoryName;
    this._requirements = requirements;
    this._learner = learner;
  }

  async isMissionCompleted(): Promise<boolean> {
    switch (this._missionCategoryName) {
      case MissionCategoryNameEnum.COMPLETE_LESSON_WITH_PERCENTAGE_SCORE:
        return this.completeDailyLessonWithPercentageScore(this._requirements);
      case MissionCategoryNameEnum.TOTAL_DURATION_OF_LEARN_DAILY_LESSON:
        return this.learnDailyLessonWithEnoughDuration(this._requirements);
      case MissionCategoryNameEnum.COMPLETE_LESSON_WITH_DIFFERENT_SKILLS:
        return this.completeDailyLessonWithDifferentSkills(this._requirements);
    }
  }

  async completeDailyLessonWithPercentageScore(percentage: number): Promise<boolean> {
    try {
      const res = await LessonRecord.getDailyLessonRecordWithPercentageScore(this._learner.id, percentage);
      return res > 0;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async learnDailyLessonWithEnoughDuration(timeInSecond: number): Promise<boolean> {
    try {
      const { totalDuration } = await LessonRecord.getTotalDurationOfLearnDailyLesson(this._learner.id);
      return totalDuration >= timeInSecond;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async completeDailyLessonWithDifferentSkills(distinctSkills: number): Promise<boolean> {
    const res = await LessonRecord.getCompletedLessonDistinctSkills(this._learner.id);
    return res.distinctSkills >= distinctSkills;
  }
}
