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
import * as fs from "fs";
import * as tmp from "tmp";
import { getConstraints } from "@app/utils/pipes";
import { Logger } from "@nestjs/common";
import { Account, Bucket, LearnerProfile, SkillTestSession } from "@app/database";
import { TestSessionStatusEnum } from "@app/types/enums";
import { BucketService } from "../../bucket/bucket.service";
import { genericHttpConsumer } from "@app/utils/axios";
import { AxiosInstance } from "axios";
import { createExpressMulterFile } from "@app/utils/audio";
import { ICurrentUser } from "@app/types/interfaces";

@Processor(EVALUATE_SPEAKING_QUEUE)
export class AISpeakingConsumer extends WorkerHost {
  private readonly logger: Logger = new Logger(this.constructor.name);
  private readonly httpService: AxiosInstance;
  constructor(
    private readonly aiSpeakingService: AISpeakingService,
    private readonly bucketService: BucketService
  ) {
    super();
    this.httpService = genericHttpConsumer();
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
      const tempFile = tmp.fileSync({ postfix: ".mp3" });

      try {
        const response = await this.httpService.get(downloadedUrl, {
          method: "GET",
          responseType: "arraybuffer",
        });

        fs.writeFileSync(tempFile.name, response.data);

        const speakingAudio = createExpressMulterFile(
          tempFile.name,
          `speaking-file-${new Date().toISOString().replace(/[:.]/g, "-")}.mp3`,
          "audio/mpeg"
        );

        const evaluations = await this.aiSpeakingService.generateScore(sessionId, speakingAudio, userResponse);
        for (const evaluation of evaluations) {
          const errors = await validate(evaluation);
          if (errors.length > 0) {
            this.logger.error("validation fail: ", errors);
          }
        }

        await SkillTestSession.save({
          id: sessionId,
          results: evaluations,
          estimatedBandScore: evaluations[evaluations.length - 1].criterias.getOverallScore(),
          status: TestSessionStatusEnum.FINISHED,
        });

        return;
      } finally {
        tempFile.removeCallback();
      }
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
