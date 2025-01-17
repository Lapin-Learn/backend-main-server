import { PayOSTransaction } from "@app/database";
import { CancelPaymentLinkDto } from "@app/types/dtos/payment/cancel-payment-link.dto";
import { PaymentStatusEnum } from "@app/types/enums";
import { IPayOSRequestLink } from "@app/types/interfaces";
import { IPayOSWebhook } from "@app/types/interfaces/payment/payos-webhook.interface";
import { Injectable, Logger } from "@nestjs/common";
import PayOS from "@payos/node";
import { WebhookDataType } from "@payos/node/lib/type";
import { createHmac } from "crypto";

@Injectable()
export class PayOSService {
  private readonly PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
  private readonly PAYOS_API_KEY = process.env.PAYOS_API_KEY;
  private readonly PAY_OS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;
  private readonly payOS = new PayOS(this.PAYOS_CLIENT_ID, this.PAYOS_API_KEY, this.PAY_OS_CHECKSUM_KEY);
  private readonly logger = new Logger(this.constructor.name);
  private readonly SUCCESS_CODE = "00";
  constructor() {}

  async createPaymentLink(request: IPayOSRequestLink) {
    try {
      const paymentLinkResponse = await this.payOS.createPaymentLink(request);
      return paymentLinkResponse;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getPaymentLinkInformation(orderId: string) {
    try {
      const verifyLinkResponse = await this.payOS.getPaymentLinkInformation(orderId);
      return verifyLinkResponse;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async cancelPayOSLink(orderId: string, { cancellationReason }: CancelPaymentLinkDto) {
    try {
      const cancelLinkResponse = await this.payOS.cancelPaymentLink(orderId, cancellationReason);
      return cancelLinkResponse;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  // TODO: update database
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
      this.logger.log(trans);
      return trans.save();
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
    const dataToSignature = createHmac("sha256", this.PAY_OS_CHECKSUM_KEY).update(dataQueryStr).digest("hex");
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
