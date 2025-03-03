import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { PayOSService } from "./payos.service";
import { PaymentWebhookController } from "./payment-webhook.controller";
import { DatabaseModule } from "@app/database";
import { ConfigService, ConfigModule } from "@nestjs/config";
import { PAYMENT_CRON_JOB, PAYOS_INSTANCE } from "@app/types/constants";
import PayOS from "@payos/node";
import { PaymentProcessor } from "./payment.processor";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: PAYMENT_CRON_JOB,
    }),
    DatabaseModule,
  ],
  providers: [
    {
      provide: PAYOS_INSTANCE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const payOSClientId = configService.get("PAYOS_CLIENT_ID");
        const payOSAPIKey = configService.get("PAYOS_API_KEY");
        const payOSChecksumKey = configService.get("PAYOS_CHECKSUM_KEY");
        const payOS = new PayOS(payOSClientId, payOSAPIKey, payOSChecksumKey);
        return payOS;
      },
    },
    PaymentService,
    PayOSService,
    PaymentProcessor,
  ],
  controllers: [PaymentController, PaymentWebhookController],
})
export class PaymentModule {}
