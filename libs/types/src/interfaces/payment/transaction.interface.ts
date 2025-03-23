import { PaymentStatusEnum } from "../../enums";
import { IAccount } from "../account.interface";
import { IItemTransaction } from "./item-transaction.interface";
import { IPayOSTransaction } from "./payos-transaction.interface";

export interface ITransaction {
  id: number;
  accountId: string;
  amount: number;
  items: IItemTransaction[];
  status: PaymentStatusEnum;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly account: IAccount;
  readonly payosTransaction: IPayOSTransaction;
}
