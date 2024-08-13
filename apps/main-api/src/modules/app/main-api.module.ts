import { Module } from "@nestjs/common";
import { MainApiController } from "./main-api.controller";
import { MainApiService } from "./main-api.service";
import { AuthModule } from "../auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { BucketModule } from "../bucket/bucket.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, BucketModule, UserModule],
  controllers: [MainApiController],
  providers: [MainApiService],
})
export class MainApiModule {}
