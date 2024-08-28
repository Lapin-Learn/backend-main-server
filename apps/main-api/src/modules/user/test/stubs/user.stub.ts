import { Account } from "@app/database";
import { v4 as uuidv4 } from "uuid";
import { AccountRoleEnum, GenderEnum, RankEnum } from "@app/types/enums";
import { mockEmail, mockUid } from "@app/shared-modules/firebase/__mocks__/firebase-auth.service";

const level = { id: 1, xp: 100 };
const streak = { id: 0, current: 0, target: 0, record: 0 };
const learnerProfile = {
  id: uuidv4(),
  rank: RankEnum.BRONZE,
  levelId: level.id,
  xp: 0,
  carrots: 0,
  streakId: streak.id,
  level,
  streak,
};

export const userStub = (): Account => {
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
    createdAt: new Date(),
    updatedAt: new Date(),
    learnerProfile: learnerProfile,
  } as Account;
};
