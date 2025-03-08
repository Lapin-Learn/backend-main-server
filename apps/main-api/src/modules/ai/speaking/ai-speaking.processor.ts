import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { AISpeakingService } from "./ai-speaking.service";
import { Job } from "bullmq";
import {
  EVALUATE_SPEAKING_QUEUE,
  REQUIRED_CREDENTIAL,
  SPEAKING_FILE_PREFIX,
  WORKER_ATTEMPTS,
} from "@app/types/constants";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { EvaluateSpeakingData } from "@app/types/dtos/simulated-tests";
import { getConstraints } from "@app/utils/pipes";
import { Logger } from "@nestjs/common";
import { Account, Bucket, LearnerProfile, SkillTestSession } from "@app/database";
import { GenAIPartEnum, TestSessionStatusEnum } from "@app/types/enums";
import { BucketService } from "../../bucket/bucket.service";
import { ICurrentUser } from "@app/types/interfaces";

@Processor(EVALUATE_SPEAKING_QUEUE, {
  concurrency: 1,
})
export class AISpeakingConsumer extends WorkerHost {
  private readonly logger: Logger = new Logger(this.constructor.name);
  constructor(
    private readonly aiSpeakingService: AISpeakingService,
    private readonly bucketService: BucketService
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      const speakingData: EvaluateSpeakingData = plainToInstance(EvaluateSpeakingData, job.data);
      const errors = await validate(speakingData, { forbidNonWhitelisted: true });

      if (errors.length > 0) {
        const error = getConstraints(errors[0]);
        throw new Error(Object.keys(error)[0]);
      }

      const { userResponse, sessionId } = speakingData;
      const fileName = `${SPEAKING_FILE_PREFIX}-${sessionId}`;
      const bucket = await Bucket.findOneOrFail({
        where: { name: fileName },
      });
      const account = await Account.findOneOrFail({
        where: { id: bucket.owner },
        relations: {
          learnerProfile: true,
        },
      });
      const currentUser: ICurrentUser = {
        profileId: account.learnerProfileId,
        userId: account.id,
        role: account.role,
      };
      const downloadedUrl = await this.bucketService.getPresignedDownloadUrl(currentUser, bucket.id);

      const evaluations = await this.aiSpeakingService.generateScore(sessionId, new URL(downloadedUrl), userResponse);
      for (const evaluation of evaluations) {
        const errors = await validate(evaluation);
        if (errors.length > 0) {
          this.logger.error("validation fail: ", errors);
        }
      }

      const estimatedBandScore = evaluations
        ?.find((item) => item.part === GenAIPartEnum.OVERALL)
        ?.criterias.getOverallScore();

      await SkillTestSession.save({
        id: sessionId,
        results: evaluations,
        estimatedBandScore,
        status: TestSessionStatusEnum.FINISHED,
      });

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
      const speakingData = plainToInstance(EvaluateSpeakingData, job.data);
      const session = await SkillTestSession.findOneOrFail({
        where: { id: speakingData.sessionId },
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
