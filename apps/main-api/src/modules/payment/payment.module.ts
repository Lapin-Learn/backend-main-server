import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { PayOSService } from "./payos.service";
import { PaymentWebhookController } from "./payment-webhook.controller";
import { DatabaseModule } from "@app/database";

@Module({
  imports: [DatabaseModule],
  providers: [PaymentService, PayOSService],
  controllers: [PaymentController, PaymentWebhookController],
})
export class PaymentModule {}
