import { Module } from "@nestjs/common";
import { SharedModulesService } from "./shared-modules.service";
import { NovuModule } from "./novu/novu.module";

@Module({
  providers: [SharedModulesService],
  exports: [SharedModulesService],
  imports: [NovuModule],
})
export class SharedModulesModule {}
