import { MissionCategoryNameEnum, MissionGroupNameEnum } from "@app/types/enums";
import { LessonMission } from "@app/shared-modules/mission-factory/lesson-mission.service";
import { findMissionGroup } from "@app/utils/maps";
import { StreakMission } from "@app/shared-modules/mission-factory/streak-mission.service";
import { Injectable } from "@nestjs/common";
import { ILearnerProfile, IMission } from "@app/types/interfaces";

@Injectable()
export class MissionFactoryService {
  createMissionService(mission: IMission, learner: ILearnerProfile) {
    const categoryName = mission.quest.category as MissionCategoryNameEnum;
    const group = findMissionGroup(categoryName);
    switch (group) {
      case MissionGroupNameEnum.LESSON_MISSION:
        return new LessonMission(categoryName, mission.quest.requirements, learner);
      case MissionGroupNameEnum.STREAK_MISSION:
        return new StreakMission();
    }
  }
}
