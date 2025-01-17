import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ApiDefaultResponses } from "../../decorators";
import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard } from "../../guards";
import { PaymentService } from "./payment.service";
import PayOS from "@payos/node";
import { CreatePaymentLinkDto } from "@app/types/dtos/payment";
import { IPayOSRequestLink } from "@app/types/interfaces";
import { CancelPaymentLinkDto } from "@app/types/dtos/payment/cancel-payment-link.dto";

@ApiTags("Payment")
@ApiDefaultResponses()
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("payment")
export class PaymentController {
  private readonly payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
  );
  private readonly expireTime = 1000 * 60 * 30; // 30 minutes
  private readonly PAYMENT_REDIRECT_URL = process.env.PAYMENT_REDIRECT_URL;
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: "Create payment link" })
  @Post("payment-link")
  async createPaymentLink(@Body() data: CreatePaymentLinkDto) {
    const body: IPayOSRequestLink = {
      // TODO: create Transaction table and create orderCode from there
      orderCode: Number(String(Date.now()).slice(-6)),
      amount: data.quantity * 20,
      description: "LAPIN - SUBSCRIPTION",
      items: [
        {
          name: data.type,
          quantity: data.quantity,
          price: 20,
        },
      ],
      expiredAt: Number(String(new Date(Date.now() + this.expireTime))),
      returnUrl: `${this.PAYMENT_REDIRECT_URL}?success=true`,
      cancelUrl: `${this.PAYMENT_REDIRECT_URL}?canceled=true`,
    };
    return this.paymentService.createPaymentLink(body);
  }

  @ApiOperation({ summary: "Get payment link information" })
  @ApiParam({ name: "orderId", type: String })
  @Get("payment-link/:orderId")
  async getPaymentLinkInformation(@Param("orderId") orderId: string) {
    return this.paymentService.getPaymentLinkInformation(orderId);
  }

  @ApiOperation({ summary: "Cancel payment link" })
  @ApiParam({ name: "orderId", type: String })
  @Put("payment-link/:orderId")
  async cancelPaymentLink(@Param("orderId") orderId: string, @Body() data: CancelPaymentLinkDto) {
    return this.paymentService.cancelPayOSLink(orderId, data);
  }

  // TODO: Transaction list endpoint, they will start with /payment/transactions
}
