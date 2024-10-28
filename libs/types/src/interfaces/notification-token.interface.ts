import { IAccount } from "./account.interface";

export interface INotificationToken {
  id: string;
  accountId: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly account: IAccount;
}
