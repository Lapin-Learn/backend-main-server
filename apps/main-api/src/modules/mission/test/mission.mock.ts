import { IMission, IProfileMissionProgress, IQuest } from "@app/types/interfaces";
import {
  ActionNameEnum,
  IntervalTypeEnum,
  MissionCategoryNameEnum,
  ProfileMissionProgressStatusEnum,
} from "@app/types/enums";
import { learnerProfile } from "../../user/test/user.stub";

export const questMock: IQuest = {
  id: "1",
  name: "Test Quest",
  description: "Test Quest Description",
  quantity: 10,
  rewards: 20,
  category: MissionCategoryNameEnum.EXCEED_LEARNING_STREAK_WITHOUT_BREAK,
  requirements: 20,
  actionId: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
  type: IntervalTypeEnum.DAILY,
  action: {
    id: 1,
    name: ActionNameEnum.DAILY_LOGIN,
    quests: [],
    badges: [],
    activities: [],
  },
};

export const monthlyQuestMock: IQuest = {
  id: "1",
  name: "Test Quest",
  description: "Test Quest Description",
  quantity: 10,
  rewards: 20,
  category: MissionCategoryNameEnum.EXCEED_LEARNING_STREAK_WITHOUT_BREAK,
  requirements: 20,
  actionId: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
  type: IntervalTypeEnum.MONTHLY,
  action: {
    id: 1,
    name: ActionNameEnum.DAILY_LOGIN,
    quests: [],
    badges: [],
    activities: [],
  },
};

export const dailyMissionMock: IMission = {
  id: "1",
  questId: "1",
  type: IntervalTypeEnum.DAILY,
  createdAt: new Date(),
  updatedAt: new Date(),
  quest: questMock,
  profileMissionsProgress: [],
};

export const mockListMissionProgress: IProfileMissionProgress[] = [
  {
    id: "1",
    missionId: "1",
    profileId: "1",
    current: 5,
    status: ProfileMissionProgressStatusEnum.COMPLETED,
    mission: dailyMissionMock,
    profile: learnerProfile,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
