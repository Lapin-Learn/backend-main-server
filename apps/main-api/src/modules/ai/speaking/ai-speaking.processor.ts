import { Processor, WorkerHost } from "@nestjs/bullmq";
import { AISpeakingService } from "./ai-speaking.service";
import { Job } from "bullmq";
import { EVALUATE_SPEAKING_QUEUE } from "@app/types/constants";
import { IEvaluateSpeakingData } from "@app/types/interfaces";
import { join } from "path";
import * as ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import { tmpdir } from "os";

@Processor(EVALUATE_SPEAKING_QUEUE)
export class AISpeakingConsumer extends WorkerHost {
  constructor(private readonly aiSpeakingService: AISpeakingService) {
    super();
  }

  async process(job: Job): Promise<any> {
    const speakingData: IEvaluateSpeakingData = job.data;
    console.log("data: ", speakingData);
    const { userResponse, speakingFile } = speakingData;

    const tempDir = tmpdir();
    const tempFilePath = join(tempDir, `speaking_${Date.now()}.mp3`);

    if (!speakingFile.path && speakingFile.buffer) {
      console.log("tempFilePath: ", tempFilePath);
      await fs.writeFile(tempFilePath, speakingFile.buffer);
    }
    const outputDir = join(__dirname, "../output");
    await fs.mkdir(outputDir, { recursive: true });

    const timeStamps = userResponse.map((r) => r.timeStamp);
    timeStamps.push(null);

    const files: Express.Multer.File[] = [];

    for (let i = 0; i < userResponse.length; i++) {
      const start = timeStamps[i];
      const end = timeStamps[i + 1] || null;
      const outputFileName = join(outputDir, `part_${userResponse[i].partNo}_q${userResponse[i].questionNo}.mp3`);

      await this.extractAudioSegment(speakingFile.path, outputFileName, start, end);

      const file: Express.Multer.File = {
        ...speakingFile,
        path: outputFileName,
        filename: `part_${userResponse[i].partNo}_q${userResponse[i].questionNo}.mp3`,
      };
      files.push(file);
    }

    return files;
  }

  private extractAudioSegment(inputFile: string, outputFile: string, start: number, end: number | null): Promise<void> {
    console.log("inputFile: ", inputFile);
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputFile).setStartTime(start).output(outputFile);

      if (end !== null) {
        command.setDuration(end - start);
      }

      command.on("end", resolve).on("error", reject).run();
    });
  }
}
