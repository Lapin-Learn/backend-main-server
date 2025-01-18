import { PaymentStatusEnum } from "../../enums";
import { ITransaction } from "./transaction.interface";

export interface IPayOSTransaction {
  id: string;
  transactionId: number;
  amount: number;
  status: PaymentStatusEnum;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly transaction: ITransaction;
}
