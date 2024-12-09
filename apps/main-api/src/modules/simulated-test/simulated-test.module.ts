import { Module } from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { SimulatedTestController } from "./simulated-test.controller";

@Module({
  providers: [SimulatedTestService],
  controllers: [SimulatedTestController],
})
export class SimulatedTestModule {}
