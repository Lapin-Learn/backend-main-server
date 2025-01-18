export interface IPayOSRequestLink {
  orderCode: number;
  amount: number;
  description: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  expiredAt?: number;
  returnUrl: string;
  cancelUrl: string;
}
