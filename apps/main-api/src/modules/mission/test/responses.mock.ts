import { IntervalTypeEnum, MissionCategoryNameEnum, ProfileMissionProgressStatusEnum } from "@app/types/enums";

export const getProfileMissionProgressesResponseMock = [
  {
    interval: IntervalTypeEnum.DAILY,
    name: "Test Quest",
    description: "Test Quest Description",
    current: 10,
    status: ProfileMissionProgressStatusEnum.COMPLETED,
    missionId: "1",
    questId: "1",
    quantity: 10,
    rewards: 20,
    category: MissionCategoryNameEnum.EXCEED_LEARNING_STREAK_WITHOUT_BREAK,
    requirements: 20,
  },
];
