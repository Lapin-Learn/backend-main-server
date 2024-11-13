import { NOVU_PROVIDER_TOKEN } from "@app/types/constants";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Novu } from "@novu/node";
import { NovuService } from "./novu.service";

@Module({
  providers: [
    {
      provide: NOVU_PROVIDER_TOKEN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Novu(configService.get("NOVU_API_KEY"));
      },
    },
    NovuService,
  ],
  exports: [NovuService],
})
export class NovuModule {}
