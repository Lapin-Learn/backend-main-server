import { EVALUATE_WRITING_QUEUE } from "@app/types/constants";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { AIWritingService } from "./ai-writing.service";
import { Job } from "bullmq";
import { EvaluateWritingData } from "@app/types/dtos/simulated-tests";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";

@Processor(EVALUATE_WRITING_QUEUE)
export class AIWritingConsumer extends WorkerHost {
  constructor(private readonly aiWritingService: AIWritingService) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      const writingData: EvaluateWritingData = plainToInstance(EvaluateWritingData, job.data);
      await validateOrReject(writingData);

      await this.aiWritingService.generateScore(writingData.sessionId, writingData.userResponse);

      return;
    } catch (error) {
      console.error("Error:", error);
      return;
    }
  }
}
