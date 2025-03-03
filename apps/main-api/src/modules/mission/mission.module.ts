import { Module } from "@nestjs/common";
import { MissionService } from "./mission.service";
import { MissionController } from "./mission.controller";
import { MissionHelper } from "./mission.helper";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bullmq";
import { MISSION_CRON_JOB } from "@app/types/constants";
import { MissionProcessor } from "./mission.processor";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: MISSION_CRON_JOB,
    }),
  ],
  controllers: [MissionController],
  providers: [MissionService, MissionHelper, MissionProcessor],
})
export class MissionModule {}
