import { Module } from "@nestjs/common";
import { StreakController } from "./streak.controller";
import { StreakService } from "./streak.service";
import { DatabaseModule } from "@app/database";
import { ScheduleModule } from "@nestjs/schedule";
import { StreakHelper } from "./streak.helper";
import { NovuModule } from "@app/shared-modules/novu";

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, NovuModule],
  controllers: [StreakController],
  providers: [StreakService, StreakHelper],
})
export class StreakModule {}
