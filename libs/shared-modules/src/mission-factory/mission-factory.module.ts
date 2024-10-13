import { Module } from "@nestjs/common";
import { MissionFactoryService } from "./mission-factory.service";

@Module({
  providers: [MissionFactoryService],
  exports: [MissionFactoryService],
})
export class MissionFactoryModule {}
