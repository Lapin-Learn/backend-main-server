import { EVALUATE_WRITING_QUEUE, REQUIRED_CREDENTIAL, WORKER_ATTEMPTS } from "@app/types/constants";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { AIWritingService } from "./ai-writing.service";
import { Job } from "bullmq";
import { EvaluateWritingData } from "@app/types/dtos/simulated-tests";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { Logger } from "@nestjs/common";
import { LearnerProfile, SkillTestSession } from "@app/database";
import { TestSessionStatusEnum } from "@app/types/enums";

@Processor(EVALUATE_WRITING_QUEUE)
export class AIWritingConsumer extends WorkerHost {
  private readonly logger = new Logger(AIWritingConsumer.name);
  constructor(private readonly aiWritingService: AIWritingService) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      const writingData: EvaluateWritingData = plainToInstance(EvaluateWritingData, job.data);
      await validateOrReject(writingData);

      await this.aiWritingService.generateScore(writingData.sessionId, writingData.userResponse);

      return;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @OnWorkerEvent("failed")
  async handleFailure(job: Job) {
    const attempts = job.attemptsMade;
    if (attempts === WORKER_ATTEMPTS) {
      const writingData = plainToInstance(EvaluateWritingData, job.data);
      const session = await SkillTestSession.findOneOrFail({
        where: { id: writingData.sessionId },
        relations: {
          learnerProfile: true,
        },
      });

      await SkillTestSession.save({
        ...session,
        status: TestSessionStatusEnum.EVALUATION_FAILED,
      });

      await LearnerProfile.save({
        ...session.learnerProfile,
        carrots: session.learnerProfile.carrots + REQUIRED_CREDENTIAL,
      });
    }
  }
}
