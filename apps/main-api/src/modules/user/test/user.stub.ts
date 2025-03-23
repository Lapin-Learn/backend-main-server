import { v4 as uuidv4 } from "uuid";
import { AccountRoleEnum, BucketPermissionsEnum, BucketUploadStatusEnum, GenderEnum, RankEnum } from "@app/types/enums";
import {
  IAccount,
  IActivity,
  IBucket,
  ICurrentUser,
  ILearnerProfile,
  ILessonProcess,
  ILessonRecord,
  ILevel,
  IProfileBadge,
  IProfileItem,
  IProfileMissionProgress,
  IStreak,
} from "@app/types/interfaces";
import { mockEmail, mockUid } from "@app/shared-modules/firebase/__mocks__/firebase-auth.service";

const level: ILevel = { id: 1, xp: 100, learners: [] };
const streak: IStreak = {
  id: 0,
  current: 0,
  target: 0,
  record: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastDateGainNewStreak: new Date(),
};
export const learnerProfile: ILearnerProfile = {
  id: uuidv4(),
  rank: RankEnum.BRONZE,
  levelId: level.id,
  xp: 0,
  carrots: 0,
  streakId: streak.id,
  level,
  streak,
  activities: [] as IActivity[],
  profileItems: [] as IProfileItem[],
  profileMissionsProgress: [] as IProfileMissionProgress[],
  profileBadges: [] as IProfileBadge[],
  lessonRecords: [] as ILessonRecord[],
  lessonProcesses: [] as ILessonProcess[],
  createdAt: new Date(),
  updatedAt: new Date(),
};
const avatar: IBucket = {
  id: uuidv4(),
  name: "avatar",
  owner: mockUid,
  permission: BucketPermissionsEnum.PUBLIC,
  createdAt: new Date(),
  updatedAt: new Date(),
  uploadStatus: BucketUploadStatusEnum.UPLOADED,
  url: "https://google.com",
};

export const userStub = (): IAccount => {
  return {
    id: uuidv4(),
    providerId: mockUid,
    username: "test",
    email: mockEmail,
    role: AccountRoleEnum.LEARNER,
    fullName: "This is a test user stub",
    dob: new Date(),
    gender: GenderEnum.FEMALE,
    learnerProfileId: learnerProfile.id,
    avatarId: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    learnerProfile: learnerProfile,
    avatar: avatar,
  };
};

export const currentUserStub = (): ICurrentUser => {
  return {
    profileId: "",
    userId: uuidv4(),
    role: AccountRoleEnum.LEARNER,
  };
};
