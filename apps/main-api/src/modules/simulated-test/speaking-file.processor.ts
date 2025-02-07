import { PUSH_SPEAKING_FILE_QUEUE, SPEAKING_FILE_PREFIX } from "@app/types/constants";
import { WorkerHost, Processor } from "@nestjs/bullmq";
import { BucketService } from "../bucket/bucket.service";
import { Job } from "bullmq";
import { ICurrentUser } from "@app/types/interfaces";
import { Logger } from "@nestjs/common";

@Processor(PUSH_SPEAKING_FILE_QUEUE)
export class SpeakingFileConsumer extends WorkerHost {
  private readonly logger = new Logger(SpeakingFileConsumer.name);
  constructor(private readonly bucketService: BucketService) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      const {
        speakingAudio,
        sessionId,
        currentUser,
      }: { speakingAudio: Express.Multer.File; sessionId: number; currentUser: ICurrentUser } = job.data;
      const fileName = `${SPEAKING_FILE_PREFIX}-${sessionId}`;
      const uploaded = await this.bucketService.uploadFile(fileName, speakingAudio, currentUser);
      if (uploaded !== true) {
        throw new Error("Error uploading speaking file");
      }
      return;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
