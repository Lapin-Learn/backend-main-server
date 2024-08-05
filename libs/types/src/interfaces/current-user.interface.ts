import { AccountRoleEnum } from "../enums";

export interface ICurrentUser {
  id: string;
  role: AccountRoleEnum;
}
