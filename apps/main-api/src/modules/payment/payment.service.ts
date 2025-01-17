import { CancelPaymentLinkDto } from "@app/types/dtos/payment/cancel-payment-link.dto";
import { IPayOSRequestLink } from "@app/types/interfaces";
import { Injectable, Logger } from "@nestjs/common";
import PayOS from "@payos/node";

@Injectable()
export class PaymentService {
  private readonly payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
  );
  private readonly logger = new Logger(this.constructor.name);
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

  // TODO: Add webhook endpoint to handle payment verification and update database
}
