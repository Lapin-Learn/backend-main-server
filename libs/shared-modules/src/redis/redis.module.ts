import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { REDIS_PROVIDER } from "@app/types/constants";

import { RedisClientOptions } from "redis";
import { RedisService } from "./redis.service";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): RedisClientOptions => ({
        socket: {
          host: configService.get("REDIS_HOST"),
          port: configService.get("REDIS_PORT"),
        },
      }),
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
