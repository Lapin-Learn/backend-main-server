import { Processor, WorkerHost } from "@nestjs/bullmq";
import { AISpeakingService } from "./ai-speaking.service";
import { Job } from "bullmq";
import { GET_AUDIO_TRANSCRIPT } from "@app/types/constants";
import { Logger } from "@nestjs/common";
import { SkillTestSession } from "@app/database";
import { InfoSpeakingResponseDto } from "@app/types/dtos/simulated-tests";

@Processor(GET_AUDIO_TRANSCRIPT)
export class AITranscriptConsumer extends WorkerHost {
  private readonly logger: Logger = new Logger(this.constructor.name);
  constructor(private readonly aiSpeakingService: AISpeakingService) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      const { audioFiles, sessionId } = job.data;

      const transcriptions = await this.aiSpeakingService.getAudioTranscripts(audioFiles);
      const sessionData = await SkillTestSession.findOne({ where: { id: sessionId } });
      const responses = sessionData.responses as InfoSpeakingResponseDto[];
      sessionData.responses = responses.map((response, index) => {
        response.transcript = transcriptions[index];
        return response;
      });
      await sessionData.save();
      return;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
