import { ResetPasswordActionEnum } from "../enums";

export interface IResetPasswordAction {
  uid: string;
  action: ResetPasswordActionEnum;
}
