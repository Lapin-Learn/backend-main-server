import { InfoTextResponseDto } from "@app/types/dtos/simulated-tests";
import { Queue } from "bullmq";
import { IGradingStrategy } from "@app/types/interfaces";
import { EVALUATE_WRITING_QUEUE } from "@app/types/constants";

export class EvaluateWriting implements IGradingStrategy {
  private sessionId: number;
  private userResponses: InfoTextResponseDto[];
  private jobName: string = EVALUATE_WRITING_QUEUE;
  private queue: Queue;
  constructor(sessionId: number, userResponses: InfoTextResponseDto[]) {
    this.sessionId = sessionId;
    this.userResponses = userResponses;
  }

  setQueue(queue: Queue) {
    this.queue = queue;
  }

  async evaluateBandScore() {
    if (this.queue)
      await this.queue.add(
        this.jobName,
        {
          sessionId: this.sessionId,
          userResponse: this.userResponses,
        },
        {
          jobId: this.jobName,
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
  }

  getResults() {
    return null;
  }

  getEstimatedBandScore() {
    return null;
  }
}
