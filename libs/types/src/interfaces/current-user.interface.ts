import { AccountRoleEnum } from "../enums";

export interface ICurrentUser {
  userId: string;
  role: AccountRoleEnum;
}
