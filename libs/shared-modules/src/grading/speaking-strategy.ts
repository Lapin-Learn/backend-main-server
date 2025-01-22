import * as tmp from "tmp";
import * as fs from "fs";

import { Queue } from "bullmq";
import { IGradingStrategy } from "@app/types/interfaces";
import { InfoSpeakingResponseDto } from "@app/types/dtos/simulated-tests";
import { createExpressMulterFile, mergeAudioFiles } from "@app/utils/audio";
import { EVALUATE_SPEAKING_QUEUE } from "@app/types/constants";

export class EvaluateSpeaking implements IGradingStrategy {
  private sessionId: number;
  private userResponses: InfoSpeakingResponseDto[];
  private jobName: string = EVALUATE_SPEAKING_QUEUE;
  private queue: Queue;
  constructor(sessionId: number, userResponses: InfoSpeakingResponseDto[]) {
    this.sessionId = sessionId;
    this.userResponses = userResponses;
  }

  setQueue(queue: Queue) {
    this.queue = queue;
  }

  async getResponseWithTimeStampAudio(speakingFiles: Array<Express.Multer.File>) {
    const inputFilePaths = await Promise.all(
      speakingFiles.map(async (file) => {
        const tempFile = tmp.fileSync({ postfix: ".mp3" });
        fs.writeFileSync(tempFile.name, Buffer.from(file.buffer));
        return tempFile;
      })
    );

    const mergedTempFile = tmp.fileSync({ postfix: ".mp3" });

    try {
      const audioSegments = await mergeAudioFiles(
        inputFilePaths.map((file: any) => file.name),
        mergedTempFile.name
      );

      this.userResponses.forEach((r, index) => {
        r.timeStamp = audioSegments[index].end;
      });

      const speakingAudio = createExpressMulterFile(
        mergedTempFile.name,
        `speaking-file-${new Date().toISOString().replace(/[:.]/g, "-")}.mp3`,
        "audio/mpeg"
      );

      return { userResponses: this.userResponses, speakingAudio };
    } finally {
      mergedTempFile.removeCallback();
      inputFilePaths.forEach((file: any) => file.removeCallback());
    }
  }

  async evaluateBandScore() {
    if (this.queue)
      await this.queue.add(this.jobName, {
        sessionId: this.sessionId,
        userResponse: this.userResponses,
      });
  }

  getResults() {
    return null;
  }

  getEstimatedBandScore() {
    return null;
  }
}
