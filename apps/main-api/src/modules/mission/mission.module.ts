import { Module } from "@nestjs/common";
import { MissionService } from "./mission.service";
import { MissionController } from "./mission.controller";
import { MissionHelper } from "./mission.helper";

@Module({
  controllers: [MissionController],
  providers: [MissionService, MissionHelper],
})
export class MissionModule {}
