export enum PaymentStatusEnum {
  PAID = "paid",
  PENDING = "pending",
  CANCELLED = "cancelled",
  ERROR = "error",
  UNDERPAID = "underpaid",
}

export enum PaymentTypeEnum {
  CARROTS = "carrots",
}

export enum PaymentCancellationReasonEnum {
  DUPLICATED = "DUPLICATED",
  EXPIRED = "EXPIRED",
}
