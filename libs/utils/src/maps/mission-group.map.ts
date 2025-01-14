import { MissionCategoryNameEnum, MissionGroupNameEnum } from "@app/types/enums";

export const MissionGroupMap = new Map([
  [
    MissionGroupNameEnum.LESSON_MISSION,
    [
      MissionCategoryNameEnum.COMPLETE_LESSON_WITH_PERCENTAGE_SCORE,
      MissionCategoryNameEnum.TOTAL_DURATION_OF_LEARN_DAILY_LESSON,
      MissionCategoryNameEnum.COMPLETE_LESSON_WITH_DIFFERENT_SKILLS,
    ],
  ],
  [MissionGroupNameEnum.STREAK_MISSION, [MissionCategoryNameEnum.EXCEED_LEARNING_STREAK_WITHOUT_BREAK]],
]);

export function findMissionGroup(missionCategoryName: MissionCategoryNameEnum) {
  for (const [missionGroup, missionCategories] of MissionGroupMap) {
    if (missionCategories.includes(missionCategoryName)) {
      return missionGroup;
    }
  }
}
