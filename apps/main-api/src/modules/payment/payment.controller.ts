import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ApiDefaultResponses, CurrentUser } from "../../decorators";
import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard } from "../../guards";
import { PaymentService } from "./payment.service";
import { CreatePaymentLinkDto } from "@app/types/dtos/payment";
import { CancelPaymentLinkDto } from "@app/types/dtos/payment/cancel-payment-link.dto";
import { ICurrentUser } from "@app/types/interfaces";

@ApiTags("Payment")
@ApiDefaultResponses()
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("payment")
export class PaymentController {
  private readonly expireTime = 1000 * 60 * 30; // 30 minutes
  private readonly PAYMENT_REDIRECT_URL = process.env.PAYMENT_REDIRECT_URL;
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: "Create payment link" })
  @Post("payment-link")
  async createPaymentLink(@CurrentUser() user: ICurrentUser, @Body() data: CreatePaymentLinkDto) {
    return this.paymentService.createPaymentTransaction(data, user.userId);
  }

  @ApiOperation({ summary: "Get payment link information" })
  @ApiParam({ name: "orderId", type: String })
  @Get("payment-link/:orderId")
  async getPaymentLinkInformation(@Param("orderId") orderId: string) {
    return this.paymentService.getPaymentInformation(orderId);
  }

  @ApiOperation({ summary: "Cancel payment link" })
  @ApiParam({ name: "orderId", type: String })
  @Put("payment-link/:orderId")
  async cancelPaymentLink(@Param("orderId") orderId: string, @Body() data: CancelPaymentLinkDto) {
    return this.paymentService.cancelPayment(orderId, data);
  }

  // TODO: Transaction list endpoint, they will start with /payment/transactions
}
