import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FirebaseModule } from "@app/shared-modules/firebase";
import { MockController } from "./mock.controller";
import { MockService } from "./mock.service";
import { ActivityService } from "../activity/activity.service";
import { MockHelper } from "./mock.helper";

@Module({
  imports: [FirebaseModule, ConfigModule],
  controllers: [MockController],
  providers: [MockService, MockHelper, ActivityService],
})
export class MockModule {}
