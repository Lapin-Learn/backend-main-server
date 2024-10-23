import { IMission, IProfileMissionProgress } from "@app/types/interfaces";
import { Injectable } from "@nestjs/common";
import { MissionCategoryNameEnum } from "@app/types/enums";
import { LessonRecord } from "@app/database";

@Injectable()
export class MissionHelper {
  buildMissionsResponseData(profileProgress: IProfileMissionProgress[], missions: IMission[]) {
    if (missions.length === 0) {
      return [];
    }

    return Promise.all(
      missions.length === 0
        ? []
        : missions.map(async (mission) => {
            const progress = profileProgress.find((item) => item.missionId === mission.id);
            let current = progress?.current || 0;
            if (progress) {
              const { mission } = progress;
              if (mission.quest.category === MissionCategoryNameEnum.EXCEED_LEARNING_STREAK_WITHOUT_BREAK) {
                current = await LessonRecord.countMaxConsecutiveLearningLessonDate(progress.profileId);
              }
            }
            return {
              interval: mission.type,
              name: mission.quest.name,
              description: mission.quest.description,
              current,
              quantity: mission.quantity,
              rewards: mission.quest.rewards,
              category: mission.quest.category,
              requirements: mission.quest.requirements,
            };
          })
    );
  }
}
