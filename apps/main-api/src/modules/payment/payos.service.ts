import { OK_RESPONSE, PAYOS_INSTANCE } from "@app/types/constants";
import { LearnerProfile, PayOSTransaction, Transaction, UnitOfWorkService } from "@app/database";
import { CancelPaymentLinkDto } from "@app/types/dtos/payment/cancel-payment-link.dto";
import { PaymentStatusEnum, PaymentTypeEnum } from "@app/types/enums";
import { IPayOSRequestLink } from "@app/types/interfaces";
import { IPayOSWebhook } from "@app/types/interfaces/payment/payos-webhook.interface";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import PayOS from "@payos/node";
import { WebhookDataType } from "@payos/node/lib/type";
import { createHmac } from "crypto";

@Injectable()
export class PayOSService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly SUCCESS_CODE = "00";
  private readonly checksumKey: string;
  constructor(
    @Inject(PAYOS_INSTANCE)
    private readonly payOS: PayOS,
    private readonly configService: ConfigService,
    private readonly unitOfWork: UnitOfWorkService
  ) {
    this.checksumKey = this.configService.get("PAYOS_CHECKSUM_KEY");
  }

  async createPaymentLink(request: IPayOSRequestLink) {
    try {
      const manager = this.unitOfWork.getManager();
      const paymentLinkResponse = await this.payOS.createPaymentLink(request);

      // Check if the transactionId exists in the transactions table
      const existingTransaction = await manager.findOne(Transaction, { where: { id: request.orderCode } });
      if (!existingTransaction) {
        throw new Error(`Transaction with ID ${request.orderCode} does not exist`);
      }

      // Save new payos transaction
      await manager.save({
        id: paymentLinkResponse.paymentLinkId,
        transactionId: request.orderCode,
        amount: request.amount,
        status: PaymentStatusEnum.PENDING,
        metadata: paymentLinkResponse,
      });

      return paymentLinkResponse;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getPaymentLinkInformation(orderId: number) {
    try {
      const manager = this.unitOfWork.getManager();
      const verifyLinkResponse = await this.payOS.getPaymentLinkInformation(orderId);
      const currentTransaction = await manager.findOne(PayOSTransaction, { where: { transactionId: orderId } });
      return {
        ...verifyLinkResponse,
        ...currentTransaction.metadata,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async cancelPayOSLink(orderId: number, { cancellationReason }: CancelPaymentLinkDto) {
    try {
      const manager = this.unitOfWork.getManager();
      const cancelLinkResponse = await this.payOS.cancelPaymentLink(orderId, cancellationReason);
      if (
        cancelLinkResponse.status === PaymentStatusEnum.CANCELLED.toUpperCase() &&
        !cancelLinkResponse.cancellationReason
      ) {
        cancelLinkResponse.cancellationReason = cancellationReason;
        cancelLinkResponse.canceledAt = new Date().toISOString();
      }
      const transaction = await manager.findOne(PayOSTransaction, { where: { transactionId: orderId } });

      // Upsert payos transaction's metadata
      if (transaction) {
        transaction.status = PaymentStatusEnum.CANCELLED;
        transaction.metadata = cancelLinkResponse;
        await manager.save(transaction);
      } else {
        const newPayOSTransaction = PayOSTransaction.create({
          id: cancelLinkResponse.id,
          transactionId: cancelLinkResponse.orderCode,
          amount: cancelLinkResponse.amount,
          status: PaymentStatusEnum.CANCELLED,
          metadata: cancelLinkResponse,
        });
        await manager.save(newPayOSTransaction);
      }

      return cancelLinkResponse;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async handlePayOSWebhook(webhookData: IPayOSWebhook) {
    try {
      const manager = this.unitOfWork.getManager();
      const verifiedData: WebhookDataType = this.payOS.verifyPaymentWebhookData(webhookData);
      const { orderCode, amount, paymentLinkId, code } = verifiedData;

      // Upsert payos transaction's metadata
      const currentTrans = await manager.findOne(PayOSTransaction, { where: { id: paymentLinkId } });
      if (!currentTrans) {
        await manager.save({
          id: paymentLinkId,
          transactionId: orderCode,
          amount,
          status: this.SUCCESS_CODE == code ? PaymentStatusEnum.PAID : PaymentStatusEnum.ERROR,
          metadata: verifiedData,
        });
      } else {
        currentTrans.status = this.SUCCESS_CODE == code ? PaymentStatusEnum.PAID : PaymentStatusEnum.ERROR;
        currentTrans.metadata = verifiedData;

        await manager.save(currentTrans);
      }

      // Update system transaction status
      const systemTransaction = await manager.findOne(Transaction, {
        where: { id: orderCode },
        relations: {
          account: true,
        },
      });
      if (systemTransaction) {
        systemTransaction.status = this.SUCCESS_CODE == code ? PaymentStatusEnum.PAID : PaymentStatusEnum.ERROR;
        await manager.save(systemTransaction);

        if (systemTransaction.status === PaymentStatusEnum.PAID) {
          const learnerProfile = await manager.findOneOrFail(LearnerProfile, {
            where: { id: systemTransaction.account.learnerProfileId },
          });

          for (const item of systemTransaction.items) {
            if (item.name === PaymentTypeEnum.CARROTS) learnerProfile.carrots += item.quantity;
          }
          await manager.save(learnerProfile);
        }
      }

      return OK_RESPONSE;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async verifyWebhook(url: string) {
    try {
      return this.payOS.confirmWebhook(url);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  // This function will help developer test local, we cannot test webhook unless we deploy to server
  async createMockSignature(data: IPayOSWebhook["data"]) {
    const sortedDataByKey = this.sortObjDataByKey(data);
    const dataQueryStr = this.convertObjToQueryStr(sortedDataByKey);
    const dataToSignature = createHmac("sha256", this.checksumKey).update(dataQueryStr).digest("hex");
    return {
      signature: dataToSignature,
    };
  }

  // Suggestion from PayOS https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/
  private sortObjDataByKey(object) {
    const orderedObject = Object.keys(object)
      .sort()
      .reduce((obj, key) => {
        obj[key] = object[key];
        return obj;
      }, {});
    return orderedObject;
  }

  private convertObjToQueryStr(object) {
    return Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .map((key) => {
        let value = object[key];
        // Sort nested object
        if (value && Array.isArray(value)) {
          value = JSON.stringify(value.map((val) => this.sortObjDataByKey(val)));
        }
        // Set empty string if null
        if ([null, undefined, "undefined", "null"].includes(value)) {
          value = "";
        }

        return `${key}=${value}`;
      })
      .join("&");
  }
}
