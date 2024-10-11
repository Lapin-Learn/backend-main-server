import { MissionCategoryNameEnum, MissionGroupNameEnum } from "@app/types/enums";

export const MissionGroupMap = new Map([
  [MissionGroupNameEnum.LESSON_MISSION, [MissionCategoryNameEnum.COMPLETE_LESSON_WITH_PERCENTAGE_SCORE]],
  [MissionGroupNameEnum.STREAK_MISSION, [MissionCategoryNameEnum.EXCEED_STREAK]],
]);

export function findMissionGroup(missionCategoryName: MissionCategoryNameEnum) {
  for (const [missionGroup, missionCategories] of MissionGroupMap) {
    if (missionCategories.includes(missionCategoryName)) {
      return missionGroup;
    }
  }
}
