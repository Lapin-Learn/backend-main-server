import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import * as dbEntities from "./entities";
import * as dbSubscribers from "./subscribers";
import { BucketSubscriber } from "./subscribers/bucket.subscriber";
import { BucketService } from "apps/main-api/src/modules/bucket/bucket.service";
const entities = (Object.keys(dbEntities) as Array<keyof typeof dbEntities>).map((key) => dbEntities[key]);
const subscribers = (Object.keys(dbSubscribers) as Array<keyof typeof dbSubscribers>).map((key) => dbSubscribers[key]);
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("POSTGRES_HOST"),
        port: configService.get("POSTGRES_PORT"),
        username: configService.get("POSTGRES_USER"),
        password: configService.get("POSTGRES_PASSWORD"),
        database: configService.get("POSTGRES_DB"),
        entities,
        subscribers,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BucketSubscriber, BucketService],
})
export class DatabaseModule {}
