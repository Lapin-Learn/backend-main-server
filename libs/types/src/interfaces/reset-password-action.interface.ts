import { ActionEnum } from "../enums";

export interface IResetPasswordAction {
  uid: string;
  action: ActionEnum.RESET_PASSWORD;
}
