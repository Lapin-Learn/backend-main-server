import { Processor, WorkerHost } from "@nestjs/bullmq";
import { AISpeakingService } from "./ai-speaking.service";
import { Job } from "bullmq";
import { EVALUATE_SPEAKING_QUEUE } from "@app/types/constants";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { EvaluateSpeakingData } from "@app/types/dtos/simulated-tests";

@Processor(EVALUATE_SPEAKING_QUEUE)
export class AISpeakingConsumer extends WorkerHost {
  constructor(private readonly aiSpeakingService: AISpeakingService) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      const speakingData: EvaluateSpeakingData = plainToInstance(EvaluateSpeakingData, job.data);
      await validateOrReject(speakingData);
      speakingData.speakingFile.buffer = Buffer.from(speakingData.speakingFile.buffer);

      await this.aiSpeakingService.generateScore(
        speakingData.sessionId,
        speakingData.speakingFile,
        speakingData.userResponse
      );
      return;
    } catch (error) {
      console.log(error);
      return;
    }
  }
}
