import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { S3Module } from "nestjs-s3";
import { BucketController } from "./bucket.controller";
import { BucketService } from "./bucket.service";
import { DatabaseModule } from "@app/database";
import { RedisModule } from "@app/shared-modules/redis";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    S3Module.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: {
          credentials: {
            accessKeyId: configService.get("BUCKET_ACCESS_KEY_ID"),
            secretAccessKey: configService.get("BUCKET_SECRET_ACCESS_KEY"),
          },
          region: "auto",
          endpoint: configService.get("BUCKET_ENDPOINT"),
          signatureVersion: "v4",
        },
      }),
    }),
    DatabaseModule,
    RedisModule,
  ],
  controllers: [BucketController],
  providers: [BucketService],
  exports: [BucketService],
})
export class BucketModule {}
