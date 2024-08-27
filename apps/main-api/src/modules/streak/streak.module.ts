import { Module } from "@nestjs/common";
import { StreakController } from "./streak.controller";
import { StreakService } from "./streak.service";
import { DatabaseModule } from "@app/database";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule],
  controllers: [StreakController],
  providers: [StreakService],
})
export class StreakModule {}
