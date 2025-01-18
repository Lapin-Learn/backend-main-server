import { Module } from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { SimulatedTestController } from "./simulated-test.controller";
import { BucketModule } from "../bucket/bucket.module";
import { GradingModule } from "@app/shared-modules/grading";
import { BullModule } from "@nestjs/bullmq";
import { EVALUATE_SPEAKING_QUEUE, EVALUATE_WRITING_QUEUE } from "@app/types/constants";
import { RedisModule } from "@app/shared-modules/redis";

@Module({
  imports: [
    BucketModule,
    GradingModule,
    BullModule.registerQueue(
      {
        name: EVALUATE_SPEAKING_QUEUE,
      },
      {
        name: EVALUATE_WRITING_QUEUE,
      }
    ),
    BucketModule,
    RedisModule,
  ],
  providers: [SimulatedTestService],
  controllers: [SimulatedTestController],
})
export class SimulatedTestModule {}
