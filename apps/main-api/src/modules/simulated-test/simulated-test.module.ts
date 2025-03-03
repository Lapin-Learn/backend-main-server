import { Module } from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { SimulatedTestController } from "./simulated-test.controller";
import { BucketModule } from "../bucket/bucket.module";
import { GradingModule } from "@app/shared-modules/grading";
import { BullModule } from "@nestjs/bullmq";
import {
  EVALUATE_SPEAKING_QUEUE,
  EVALUATE_WRITING_QUEUE,
  GET_AUDIO_TRANSCRIPT,
  PUSH_SPEAKING_FILE_QUEUE,
} from "@app/types/constants";
import { RedisModule } from "@app/shared-modules/redis";
import { SimulatedTestReportController } from "./simulated-test-report.controller";
import { SessionController } from "./session.controller";
import { SessionService } from "./session.service";
import { SubjectModule } from "@app/shared-modules/subjects";
import { ObserverModule } from "@app/shared-modules/observers";
import { SpeakingFileConsumer } from "./speaking-file.processor";

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
      },
      {
        name: PUSH_SPEAKING_FILE_QUEUE,
      },
      {
        name: GET_AUDIO_TRANSCRIPT,
      }
    ),
    BucketModule,
    RedisModule,
    SubjectModule,
    ObserverModule,
  ],
  providers: [SimulatedTestService, SessionService, SpeakingFileConsumer],
  controllers: [SimulatedTestController, SimulatedTestReportController, SessionController],
})
export class SimulatedTestModule {}
