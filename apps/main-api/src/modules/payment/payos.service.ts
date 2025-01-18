import { PayOSTransaction, Transaction } from "@app/database";
import { PAYOS_OPTIONS } from "@app/types/constants";
import { CancelPaymentLinkDto } from "@app/types/dtos/payment/cancel-payment-link.dto";
import { PaymentStatusEnum } from "@app/types/enums";
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
    @Inject(PAYOS_OPTIONS)
    private readonly payOS: PayOS,
    private readonly configService: ConfigService
  ) {
    this.checksumKey = this.configService.get("PAYOS_CHECKSUM_KEY");
  }

  async createPaymentLink(request: IPayOSRequestLink) {
    try {
      const paymentLinkResponse = await this.payOS.createPaymentLink(request);
      return paymentLinkResponse;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getPaymentLinkInformation(orderId: number) {
    try {
      const verifyLinkResponse = await this.payOS.getPaymentLinkInformation(orderId);
      return verifyLinkResponse;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async cancelPayOSLink(orderId: number, { cancellationReason }: CancelPaymentLinkDto) {
    try {
      const cancelLinkResponse = await this.payOS.cancelPaymentLink(orderId, cancellationReason);
      return cancelLinkResponse;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async handlePayOSWebhook(webhookData: IPayOSWebhook) {
    // Handle webhook data here
    try {
      const verifiedData: WebhookDataType = this.payOS.verifyPaymentWebhookData(webhookData);
      const { orderCode, amount, paymentLinkId, code } = verifiedData;
      const trans = PayOSTransaction.create({
        id: paymentLinkId,
        transactionId: orderCode,
        amount,
        status: this.SUCCESS_CODE == code ? PaymentStatusEnum.PAID : PaymentStatusEnum.ERROR,
        metadata: verifiedData,
      });

      const systemTransaction = await Transaction.findOne({ where: { id: orderCode } });
      if (systemTransaction) {
        systemTransaction.status = this.SUCCESS_CODE == code ? PaymentStatusEnum.PAID : PaymentStatusEnum.ERROR;
        systemTransaction.save();
      }

      const currentTrans = await PayOSTransaction.findOne({ where: { id: paymentLinkId } });
      if (!currentTrans) {
        await trans.save();
      }
      return trans;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async verifyWebhook() {
    try {
      return this.payOS.confirmWebhook("http://staging.lapinlearn.edu.vn/api/payment/webhook");
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
