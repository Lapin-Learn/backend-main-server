import { Module } from "@nestjs/common";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { BucketService } from "../bucket/bucket.service";

@Module({
  controllers: [BlogController],
  providers: [BlogService, BucketService],
})
export class BlogModule {}
