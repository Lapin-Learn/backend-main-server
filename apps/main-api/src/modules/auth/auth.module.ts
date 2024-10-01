import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { FirebaseModule } from "@app/shared-modules/firebase";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { DatabaseModule } from "@app/database";
import { AuthHelper } from "./auth.helper";
import { FirebaseStrategy, ProviderStrategy } from "../../strategies";
import { MailModule } from "@app/shared-modules/mail";
import { RedisModule } from "@app/shared-modules/redis";

@Module({
  imports: [PassportModule, DatabaseModule, FirebaseModule, ConfigModule, MailModule, RedisModule],
  controllers: [AuthController],
  providers: [AuthService, AuthHelper, FirebaseStrategy, ProviderStrategy],
  exports: [AuthService],
})
export class AuthModule {}
