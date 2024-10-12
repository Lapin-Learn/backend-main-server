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
        return this.completeLessonWithPercentageScore(this._requirements);
    }
  }

  async completeLessonWithPercentageScore(percentage: number): Promise<boolean> {
    try {
      const res = await LessonRecord.getDailyLessonRecordWithPercentageScore(this._learner.id, percentage);
      return res > 0;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
