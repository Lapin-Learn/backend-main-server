import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiDefaultResponses } from "../../decorators";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { PayOSService } from "./payos.service";

@ApiTags("Payment")
@ApiDefaultResponses()
@Controller("payment")
export class PaymentWebhookController {
  constructor(private readonly payOSService: PayOSService) {}
  @ApiOperation({ summary: "Handle PayOS webhook" })
  @Post("payos-webhook")
  async handlePayOSWebhook(@Body() webhookData: any) {
    return this.payOSService.handlePayOSWebhook(webhookData);
  }

  @ApiOperation({ summary: "Verify PayOS webhook" })
  @Get("payos-webhook")
  async verifyWebhook() {
    return this.payOSService.verifyWebhook();
  }

  @ApiOperation({ summary: "Generate signature" })
  @Post("payos-signature")
  async generateSignature(@Body() data: any) {
    return this.payOSService.createMockSignature(data);
  }
}
