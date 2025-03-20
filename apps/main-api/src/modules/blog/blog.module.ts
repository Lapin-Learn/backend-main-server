import { Module } from "@nestjs/common";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { BucketService } from "../bucket/bucket.service";
import { RedisModule } from "@app/shared-modules/redis";

@Module({
  imports: [RedisModule],
  controllers: [BlogController],
  providers: [BlogService, BucketService],
})
export class BlogModule {}
