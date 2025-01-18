import { PaymentStatusEnum } from "../../enums";
import { IAccount } from "../account.interface";

export interface ITransaction {
  id: number;
  accountId: string;
  status: PaymentStatusEnum;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly account: IAccount;
}
