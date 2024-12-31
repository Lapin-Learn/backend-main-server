import { Processor, WorkerHost } from "@nestjs/bullmq";
import { AISpeakingService } from "./ai-speaking.service";
import { Job } from "bullmq";

@Processor("evaluate-speaking")
export class AISpeakingConsumer extends WorkerHost {
  constructor(private readonly aiSpeakingService: AISpeakingService) {
    super();
  }

  async process(job: Job): Promise<any> {
    console.log("job data: ", job.data);
  }
}
