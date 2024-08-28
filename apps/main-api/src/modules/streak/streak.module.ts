import { Module } from "@nestjs/common";
import { StreakController } from "./streak.controller";
import { StreakService } from "./streak.service";
import { DatabaseModule } from "@app/database";
import { ScheduleModule } from "@nestjs/schedule";
import { StreakHelper } from "./streak.helper";

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule],
  controllers: [StreakController],
  providers: [StreakService, StreakHelper],
})
export class StreakModule {}
