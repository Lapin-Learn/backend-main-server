import { Module } from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { SimulatedTestController } from "./simulated-test.controller";
import { BucketModule } from "../bucket/bucket.module";

@Module({
  imports: [BucketModule],
  providers: [SimulatedTestService],
  controllers: [SimulatedTestController],
})
export class SimulatedTestModule {}
