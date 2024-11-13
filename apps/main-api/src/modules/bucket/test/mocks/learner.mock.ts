import { AccountRoleEnum } from "@app/types/enums";
import { ICurrentUser } from "@app/types/interfaces";
import { randomUUID } from "crypto";

export const learner: ICurrentUser = {
  userId: randomUUID(),
  role: AccountRoleEnum.LEARNER,
  profileId: randomUUID(),
};
