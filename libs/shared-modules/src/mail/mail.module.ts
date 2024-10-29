import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { SESClientConfig } from "@aws-sdk/client-ses";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    {
      provide: "AWS_SES_CLIENT_TOKEN",
      inject: [ConfigService],
      useFactory: (configService: ConfigService): SESClientConfig => ({
        credentials: {
          accessKeyId: configService.get("AWS_ACCESS_KEY_ID"),
          secretAccessKey: configService.get("AWS_SECRET_ACCESS_KEY"),
        },
        region: configService.get("AWS_REGION"),
      }),
    },
  ],
  exports: [MailService],
})
export class MailModule {}
