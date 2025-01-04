import { Processor, WorkerHost } from "@nestjs/bullmq";
import { AISpeakingService } from "./ai-speaking.service";
import { Job } from "bullmq";
import { EVALUATE_SPEAKING_QUEUE } from "@app/types/constants";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { EvaluateSpeakingData } from "@app/types/dtos/simulated-tests";
import * as fs from "fs";
import * as path from "path";
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

      const permanentDir = path.join(__dirname, "public", "audio_files");
      if (!fs.existsSync(permanentDir)) {
        fs.mkdirSync(permanentDir, { recursive: true });
      }

      const inputFilePaths = await Promise.all(
        speakingData.speakingFiles.map(async (file, index) => {
          const permanentFilePath = path.join(permanentDir, `file${index + 1}.m4a`);
          fs.writeFileSync(permanentFilePath, Buffer.from(file.buffer)); // Save file buffer to permanent file
          return permanentFilePath;
        })
      );

      const outputFilePath = path.join(permanentDir, "merged_audio.mp3");

      await this.mergeAudioFiles(inputFilePaths, outputFilePath);

      const mergedFile: Express.Multer.File = {
        fieldname: "speakingFile",
        originalname: "merged_audio.mp3",
        encoding: "7bit",
        mimetype: "audio/mpeg",
        buffer: fs.readFileSync(outputFilePath),
        size: fs.statSync(outputFilePath).size,
        stream: fs.createReadStream(outputFilePath),
        destination: permanentDir,
        filename: "merged_audio.mp3",
        path: outputFilePath,
      };

      await this.aiSpeakingService.generateScore(speakingData.sessionId, mergedFile, speakingData.userResponse);

      return;
    } catch (error) {
      console.log("Error:", error);
      return;
    }
  }

  async mergeAudioFiles(audioFiles: string[], outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const instance = ffmpeg();
      audioFiles.forEach((audioFile) => {
        instance.addInput(audioFile);
      });

      console.log("outputPath: ", outputPath);
      instance
        .audioCodec("libmp3lame")
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
