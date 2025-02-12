import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { FirebaseModule } from "@app/shared-modules/firebase";
import { AdminController } from "./admin.controller";
import { BucketModule } from "../bucket/bucket.module";

@Module({
  imports: [FirebaseModule, ConfigModule, BucketModule],
  controllers: [UserController, AdminController],
  providers: [UserService],
})
export class UserModule {}
