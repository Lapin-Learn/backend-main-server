import { CancelPaymentLinkDto } from "@app/types/dtos/payment/cancel-payment-link.dto";
import { IPayOSRequestLink } from "@app/types/interfaces";
import { Injectable, Logger } from "@nestjs/common";
import { PayOSService } from "./payos.service";
import { CreatePaymentLinkDto } from "@app/types/dtos/payment";
import { Transaction } from "@app/database/entities/transaction.entity";
import { PaymentStatusEnum } from "@app/types/enums";

@Injectable()
export class PaymentService {
  private readonly expireTime = 1000 * 60 * 30; // 30 minutes
  private readonly logger = new Logger(this.constructor.name);
  private readonly PAYMENT_REDIRECT_URL = process.env.PAYMENT_REDIRECT_URL;
  constructor(private readonly payOSService: PayOSService) {}

  async createPaymentTransaction(data: CreatePaymentLinkDto, userId: string) {
    try {
      const { quantity } = data;
      const newTransaction = await Transaction.create({
        accountId: userId,
        status: PaymentStatusEnum.PENDING,
      }).save();

      const request: IPayOSRequestLink = {
        orderCode: newTransaction.id,
        amount: data.quantity * 20,
        description: "LAPIN - SUBSCRIPTION",
        items: [
          {
            name: data.type,
            quantity,
            price: 20,
          },
        ],
        expiredAt: Number(String(new Date(Date.now() + this.expireTime))),
        returnUrl: `${this.PAYMENT_REDIRECT_URL}?success=true`,
        cancelUrl: `${this.PAYMENT_REDIRECT_URL}?canceled=true`,
      };
      return this.payOSService.createPaymentLink(request);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getPaymentInformation(orderId: number) {
    try {
      const transaction = await Transaction.findOne({
        where: { id: orderId },
      });
      const information = await this.payOSService.getPaymentLinkInformation(orderId);
      const { status } = information;
      if (transaction) {
        transaction.status = status.toLowerCase() as PaymentStatusEnum;
        transaction.save();
      }
      return information;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async cancelPayment(orderId: number, { cancellationReason }: CancelPaymentLinkDto) {
    try {
      const information = await this.payOSService.cancelPayOSLink(orderId, { cancellationReason });
      const transaction = await Transaction.findOne({
        where: { id: orderId },
      });
      if (transaction) {
        transaction.status = PaymentStatusEnum.CANCELLED;
        transaction.save();
      }
      return information;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  // TODO: Add webhook endpoint to handle payment verification and update database
}
