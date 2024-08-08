import { Account } from "@app/database";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "./user.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserRepositoryModule {}
