import { PaymentTypeEnum } from "@app/types/enums";

export interface IItemTransaction {
  name: PaymentTypeEnum;
  price: number;
  quantity: number;
}
