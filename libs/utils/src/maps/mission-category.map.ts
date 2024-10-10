import { MissionCategoryNameEnum, MissionNameEnum } from "@app/types/enums";

export const MissionCategoryMap = new Map([
  [
    MissionCategoryNameEnum.LESSON_MISSION,
    [MissionNameEnum.COMPLETE_LESSON_PERFECTLY, MissionNameEnum.COMPLETE_LESSON_WITH_PERCENTAGE_SCORE],
  ],
  [MissionCategoryNameEnum.STREAK_MISSION, [MissionNameEnum.EXCEED_STREAK]],
]);
