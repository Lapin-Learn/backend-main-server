import { MissionServiceAbstract } from "@app/types/abstracts";
import { Logger } from "@nestjs/common";
import { MissionCategoryNameEnum } from "@app/types/enums";
import { ILearnerProfile, IMission } from "@app/types/interfaces";
import { LessonRecord } from "@app/database";
import moment from "moment-timezone";
import { Between } from "typeorm";

export class StreakMission extends MissionServiceAbstract {
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
      case MissionCategoryNameEnum.EXCEED_LEARNING_STREAK_WITHOUT_BREAK:
        return this.isExceedLearningStreak();
    }
  }

  async isExceedLearningStreak(): Promise<boolean> {
    try {
      const requirement = this._mission.quest.requirements;
      const today = moment().tz("Asia/Ho_Chi_Minh").startOf("day").toDate();
      const res = await LessonRecord.find({
        where: { learnerProfileId: this._learner.id, createdAt: Between(today, moment(today).endOf("day").toDate()) },
      });
      return res.length === requirement;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
