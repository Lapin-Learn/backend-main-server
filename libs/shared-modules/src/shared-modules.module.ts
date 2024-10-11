import { Module } from "@nestjs/common";
import { SharedModulesService } from "./shared-modules.service";
import { MissionFactoryModule } from "./mission-factory/mission-factory.module";

@Module({
  providers: [SharedModulesService],
  exports: [SharedModulesService],
  imports: [MissionFactoryModule],
})
export class SharedModulesModule {}
