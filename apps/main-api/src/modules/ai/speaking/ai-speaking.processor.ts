import { Processor, WorkerHost } from "@nestjs/bullmq";
import { AISpeakingService } from "./ai-speaking.service";
import { Job } from "bullmq";
import { EVALUATE_SPEAKING_QUEUE } from "@app/types/constants";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { EvaluateSpeakingData } from "@app/types/dtos/simulated-tests";
import * as fs from "fs";
import * as tmp from "tmp";
import ffmpeg from "fluent-ffmpeg";

@Processor(EVALUATE_SPEAKING_QUEUE)
export class AISpeakingConsumer extends WorkerHost {
  constructor(private readonly aiSpeakingService: AISpeakingService) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      const speakingData: EvaluateSpeakingData = plainToInstance(EvaluateSpeakingData, job.data);
      await validateOrReject(speakingData);

      const inputFilePaths = await Promise.all(
        speakingData.speakingFiles.map(async (file) => {
          const tempFile = tmp.fileSync({ postfix: ".m4a" });
          fs.writeFileSync(tempFile.name, Buffer.from(file.buffer));
          return tempFile;
        })
      );

      const mergedTempFile = tmp.fileSync({ postfix: ".mp3" });

      await this.mergeAudioFiles(
        inputFilePaths.map((file) => file.name),
        mergedTempFile.name
      );

      inputFilePaths.forEach((tempFile) => tempFile.removeCallback());

      const mergedFile: Express.Multer.File = {
        fieldname: "speakingFile",
        originalname: `speaking_file_${new Date().toISOString().replace(/[:.]/g, "-")}.mp3`,
        encoding: "7bit",
        mimetype: "audio/mpeg",
        buffer: fs.readFileSync(mergedTempFile.name),
        size: fs.statSync(mergedTempFile.name).size,
        stream: fs.createReadStream(mergedTempFile.name),
        destination: null,
        filename: mergedTempFile.name,
        path: mergedTempFile.name,
      };

      await this.aiSpeakingService.generateScore(speakingData.sessionId, mergedFile, speakingData.userResponse);

      return;
    } catch (error) {
      console.error("Error:", error);
      return;
    }
  }

  async mergeAudioFiles(audioFiles: string[], outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const instance = ffmpeg();
      audioFiles.forEach((audioFile) => {
        instance.addInput(audioFile);
      });

      instance
        .on("error", (err) => {
          console.error("Error during audio merging:", err);
          reject(err);
        })
        .on("end", () => {
          console.log("Audio files merged successfully.");
          resolve();
        })
        .mergeToFile(outputPath, "./tmp/");
    });
  }
}
