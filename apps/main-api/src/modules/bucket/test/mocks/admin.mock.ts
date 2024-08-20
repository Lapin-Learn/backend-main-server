import { AccountRoleEnum } from "@app/types/enums";
import { ICurrentUser } from "@app/types/interfaces";
import { randomUUID } from "crypto";

export const admin: ICurrentUser = {
  userId: randomUUID(),
  role: AccountRoleEnum.ADMIN,
};
