import { Module } from "@nestjs/common";
import { UserRepositoryModule } from "../repository/user-repository.module";
import { ConfigModule } from "@nestjs/config";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { FirebaseModule } from "@app/shared-modules/firebase";

@Module({
  imports: [UserRepositoryModule, FirebaseModule, ConfigModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
