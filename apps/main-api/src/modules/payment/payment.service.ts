import { CancelPaymentLinkDto } from "@app/types/dtos/payment/cancel-payment-link.dto";
import { IPayOSRequestLink } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PayOSService } from "./payos.service";
import { CreatePaymentLinkDto } from "@app/types/dtos/payment";
import { PaymentCancellationReasonEnum, PaymentStatusEnum } from "@app/types/enums";
import { ConfigService } from "@nestjs/config";
import { Transaction, UnitOfWorkService } from "@app/database";
import { EntityManager } from "typeorm";
import { EXPIRED_TIME, VN_TIME_ZONE } from "@app/types/constants";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class PaymentService {
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
        const amount = quantity * 20;
        const items = [
          {
            name: data.type,
            quantity,
            price: 20,
          },
        ];

        const pendingTransactions = await Transaction.getDuplicatedTransactions(userId, items);
        if (pendingTransactions.length > 0) {
          this.cancelListOfTransactions(pendingTransactions, PaymentCancellationReasonEnum.DUPLICATE);
        }

        const newTransaction = await manager.save(
          Transaction.create({
            accountId: userId,
            status: PaymentStatusEnum.PENDING,
            amount,
            items,
          })
        );

        const request: IPayOSRequestLink = {
          orderCode: newTransaction.id,
          amount,
          description: "LAPIN - SUBSCRIPTION",
          items,
          expiredAt: Number(String(new Date(Date.now() + EXPIRED_TIME))),
          returnUrl: `${this.paymentRedirectUrl}?success=true`,
          cancelUrl: `${this.paymentRedirectUrl}?canceled=true`,
        };

        return this.payOSService.createPaymentLink(request, manager);
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

  async getTransactionHistory(accountId: string, offset: number, limit: number) {
    try {
      const { transactions, total } = await Transaction.getTransactionHistory(accountId, offset, limit);
      return { items: transactions, total };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  @Cron("00 00 * * *", {
    name: "Revoke expired transactions",
    timeZone: VN_TIME_ZONE,
  }) // 12AM every day
  async revokeExpiredTransactions() {
    try {
      const expiredTransactions = await Transaction.getExpiredTransactions();
      if (expiredTransactions.length > 0) {
        const { fulfilled, rejected } = await this.cancelListOfTransactions(
          expiredTransactions,
          PaymentCancellationReasonEnum.EXPIRED
        );
        this.logger.log(`Revoked ${fulfilled} transactions, ${rejected} transactions failed`);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async cancelListOfTransactions(
    transactions: Transaction[],
    cancellationReason: PaymentCancellationReasonEnum
  ) {
    let rejected = 0;
    let fulfilled = 0;

    for (const transaction of transactions) {
      try {
        await this.cancelPayment(transaction.id, { cancellationReason });
        await new Promise((resolve) => setTimeout(resolve, 200));
        fulfilled++;
      } catch (error) {
        this.logger.error(error);
        rejected++;
      }
    }
    return { fulfilled, rejected };
  }
}
