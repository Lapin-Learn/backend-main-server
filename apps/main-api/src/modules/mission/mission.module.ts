import { Module } from "@nestjs/common";
import { MissionService } from "./mission.service";
import { MissionController } from "./mission.controller";
import { MissionHelper } from "./mission.helper";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [MissionController],
  providers: [MissionService, MissionHelper],
})
export class MissionModule {}
