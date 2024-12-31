import { Module } from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { SimulatedTestController } from "./simulated-test.controller";
import { BucketModule } from "../bucket/bucket.module";
import { GradingModule } from "@app/shared-modules/grading";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    BucketModule,
    GradingModule,
    BullModule.registerQueue({
      name: "evaluate-speaking",
    }),
  ],
  providers: [SimulatedTestService],
  controllers: [SimulatedTestController],
})
export class SimulatedTestModule {}
