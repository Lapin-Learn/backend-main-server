import { AccountRoleEnum } from "../enums";

export interface ICurrentUser {
  userId: string;
  profileId: string;
  role: AccountRoleEnum;
}
