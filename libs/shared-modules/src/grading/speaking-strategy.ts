import tmp, { FileResult } from "tmp";
import * as fs from "fs";

import { Queue } from "bullmq";
import { ICurrentUser, IGradingStrategy } from "@app/types/interfaces";
import { InfoSpeakingResponseDto } from "@app/types/dtos/simulated-tests";
import { createExpressMulterFile, mergeAudioFiles } from "@app/utils/audio";
import { EVALUATE_SPEAKING_QUEUE, PUSH_SPEAKING_FILE_QUEUE } from "@app/types/constants";

export class EvaluateSpeaking implements IGradingStrategy {
  private sessionId: number;
  private userResponses: InfoSpeakingResponseDto[];
  private jobEvaluateSpeakingName: string = EVALUATE_SPEAKING_QUEUE;
  private jobPushSpeakingFileName: string = PUSH_SPEAKING_FILE_QUEUE;
  private evaluateSpeakingqueue: Queue;
  private pushSpeakingFileQueue: Queue;
  constructor(sessionId: number, userResponses: InfoSpeakingResponseDto[]) {
    this.sessionId = sessionId;
    this.userResponses = userResponses;
  }

  setEvaluateSpeakingQueue(queue: Queue) {
    this.evaluateSpeakingqueue = queue;
  }

  setPushSpeakingFileQueue(queue: Queue) {
    this.pushSpeakingFileQueue = queue;
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
      inputFilePaths.forEach((file: FileResult) => file.removeCallback());
      mergedTempFile.removeCallback();
    }
  }

  async evaluateBandScore() {
    if (this.evaluateSpeakingqueue)
      await this.evaluateSpeakingqueue.add(
        this.jobEvaluateSpeakingName,
        {
          sessionId: this.sessionId,
          userResponse: this.userResponses,
        },
        {
          jobId: this.jobEvaluateSpeakingName,
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
  }

  async pushSpeakingFile(speakingAudio: Express.Multer.File, currentUser: ICurrentUser) {
    if (this.pushSpeakingFileQueue)
      await this.pushSpeakingFileQueue.add(
        this.jobPushSpeakingFileName,
        {
          sessionId: this.sessionId,
          speakingAudio,
          currentUser,
        },
        {
          jobId: this.jobEvaluateSpeakingName,
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
