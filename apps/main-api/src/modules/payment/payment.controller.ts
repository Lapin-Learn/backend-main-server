import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ApiDefaultResponses, CurrentUser } from "../../decorators";
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FirebaseJwtAuthGuard } from "../../guards";
import { PaymentService } from "./payment.service";
import { CreatePaymentLinkDto } from "@app/types/dtos/payment";
import { CancelPaymentLinkDto } from "@app/types/dtos/payment/cancel-payment-link.dto";
import { ICurrentUser } from "@app/types/interfaces";
import { PaginationInterceptor } from "@app/utils/interceptors";

@ApiTags("Payment")
@ApiDefaultResponses()
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: "Create payment link" })
  @Post("payment-link")
  async createPaymentLink(@CurrentUser() user: ICurrentUser, @Body() data: CreatePaymentLinkDto) {
    return this.paymentService.createPaymentTransaction(data, user.userId);
  }

  @ApiOperation({ summary: "Get payment link information" })
  @ApiParam({ name: "orderId", type: Number })
  @Get("payment-link/:orderId")
  async getPaymentLinkInformation(@Param("orderId") orderId: number) {
    return this.paymentService.getPaymentInformation(orderId);
  }

  @ApiOperation({ summary: "Cancel payment link" })
  @ApiParam({ name: "orderId", type: Number })
  @Put("payment-link/:orderId")
  async cancelPaymentLink(@Param("orderId") orderId: number, @Body() data: CancelPaymentLinkDto) {
    return this.paymentService.cancelPayment(orderId, data);
  }

  @ApiOperation({
    summary: "Get all transactions belong to current user",
  })
  @ApiQuery({ name: "offset", type: Number, required: false })
  @ApiQuery({ name: "limit", type: Number, required: false })
  @Get("/transactions")
  @UseInterceptors(PaginationInterceptor)
  async getTransactionHistory(
    @CurrentUser() user: ICurrentUser,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.paymentService.getTransactionHistory(user.userId, offset, limit);
  }
}
