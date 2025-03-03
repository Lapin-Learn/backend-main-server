import { Module } from "@nestjs/common";
import { StreakController } from "./streak.controller";
import { StreakService } from "./streak.service";
import { DatabaseModule } from "@app/database";
import { ScheduleModule } from "@nestjs/schedule";
import { StreakHelper } from "./streak.helper";
import { NovuModule } from "@app/shared-modules/novu";
import { BullModule } from "@nestjs/bullmq";
import { STREAK_CRON_JOB } from "@app/types/constants";
import { StreakProcessor } from "./streak.processor";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: STREAK_CRON_JOB,
    }),
    DatabaseModule,
    NovuModule,
  ],
  controllers: [StreakController],
  providers: [StreakService, StreakHelper, StreakProcessor],
})
export class StreakModule {}
