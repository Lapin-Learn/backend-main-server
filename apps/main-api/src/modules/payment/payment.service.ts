import { CancelPaymentLinkDto } from "@app/types/dtos/payment/cancel-payment-link.dto";
import { IPayOSRequestLink } from "@app/types/interfaces";
import { Injectable, Logger } from "@nestjs/common";
import { PayOSService } from "./payos.service";
import { CreatePaymentLinkDto } from "@app/types/dtos/payment";
import { Transaction } from "@app/database/entities/transaction.entity";
import { PaymentStatusEnum } from "@app/types/enums";
import { ConfigService } from "@nestjs/config";
import { UnitOfWorkService } from "@app/database";
import { EntityManager } from "typeorm";

@Injectable()
export class PaymentService {
  private readonly expireTime = 1000 * 60 * 30; // 30 minutes
  private readonly logger = new Logger(this.constructor.name);
  private readonly paymentRedirectUrl: string;
  constructor(
    private readonly payOSService: PayOSService,
    private readonly configService: ConfigService,
    private readonly unitOfWork: UnitOfWorkService
  ) {
    this.paymentRedirectUrl = this.configService.get("PAYMENT_REDIRECT_URL");
  }

  async createPaymentTransaction(data: CreatePaymentLinkDto, userId: string) {
    return this.unitOfWork.doTransactional(async (manager: EntityManager) => {
      try {
        const { quantity } = data;
        const newTransaction = await manager.save(
          Transaction.create({
            accountId: userId,
            status: PaymentStatusEnum.PENDING,
          })
        );

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
          returnUrl: `${this.paymentRedirectUrl}?success=true`,
          cancelUrl: `${this.paymentRedirectUrl}?canceled=true`,
        };

        return this.payOSService.createPaymentLink(request);
      } catch (error) {
        this.logger.error(error);
        throw error;
      }
    });
  }

  async getPaymentInformation(orderId: number) {
    return this.unitOfWork.doTransactional(async (manager: EntityManager) => {
      try {
        const transaction = await Transaction.findOne({
          where: { id: orderId },
        });
        const information = await this.payOSService.getPaymentLinkInformation(orderId);
        const { status } = information;
        if (transaction) {
          transaction.status = status.toLowerCase() as PaymentStatusEnum;
          await manager.save(transaction);
        }
        return information;
      } catch (error) {
        this.logger.error(error);
        throw error;
      }
    });
  }

  async cancelPayment(orderId: number, { cancellationReason }: CancelPaymentLinkDto) {
    return this.unitOfWork.doTransactional(async (manager: EntityManager) => {
      try {
        const information = await this.payOSService.cancelPayOSLink(orderId, { cancellationReason });
        const transaction = await Transaction.findOne({
          where: { id: orderId },
        });
        if (transaction) {
          transaction.status = PaymentStatusEnum.CANCELLED;
          await manager.save(transaction);
        }
        return information;
      } catch (error) {
        this.logger.error(error);
        throw error;
      }
    });
  }
}
