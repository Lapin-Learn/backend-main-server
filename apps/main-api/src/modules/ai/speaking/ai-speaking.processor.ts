import { Processor, WorkerHost } from "@nestjs/bullmq";
import { AISpeakingService } from "./ai-speaking.service";
import { Job } from "bullmq";
import { EVALUATE_SPEAKING_QUEUE } from "@app/types/constants";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { EvaluateSpeakingData } from "@app/types/dtos/simulated-tests";
import * as fs from "fs";
import * as tmp from "tmp";
import ffmpeg from "fluent-ffmpeg";
import { getConstraints } from "@app/utils/pipes";

@Processor(EVALUATE_SPEAKING_QUEUE)
export class AISpeakingConsumer extends WorkerHost {
  constructor(private readonly aiSpeakingService: AISpeakingService) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      const speakingData: EvaluateSpeakingData = plainToInstance(EvaluateSpeakingData, job.data);
      const errors = await validate(speakingData, { forbidNonWhitelisted: true });

      if (errors.length > 0) {
        const error = getConstraints(errors[0]);
        throw new Error(Object.keys(error)[0]);
      }

      const { speakingFiles, userResponse, sessionId } = speakingData;

      const inputFilePaths = await Promise.all(
        speakingFiles.map(async (file) => {
          const tempFile = tmp.fileSync({ postfix: ".m4a" });
          fs.writeFileSync(tempFile.name, Buffer.from(file.buffer));
          return tempFile;
        })
      );

      const mergedTempFile = tmp.fileSync({ postfix: ".mp3" });

      const audioSegments = await this.mergeAudioFiles(
        inputFilePaths.map((file) => file.name),
        mergedTempFile.name
      );

      userResponse.forEach((r, index) => {
        r["timeStamp"] = audioSegments[index].duration;
      });

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

      await this.aiSpeakingService.generateScore(sessionId, mergedFile, userResponse);
      mergedTempFile.removeCallback();

      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async mergeAudioFiles(audioFiles: string[], outputPath: string): Promise<{ start: number; duration: number }[]> {
    try {
      const audioTimestamps: { file: string; start: number; duration: number }[] = [];
      let currentStartTime = 0;

      for (const audioFile of audioFiles) {
        const metadata = await this.getAudioMetadata(audioFile);
        audioTimestamps.push({
          file: audioFile,
          start: currentStartTime,
          duration: metadata.duration,
        });
        currentStartTime += metadata.duration;
      }

      await new Promise<void>((resolve, reject) => {
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

      return audioTimestamps.map(({ start, duration }) => ({ start, duration }));
    } catch (error) {
      console.error("Error in mergeAudioFiles:", error);
      throw error;
    }
  }

  async getAudioMetadata(filePath: string): Promise<{ start_time: number; duration: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const format = metadata.format;
          resolve({
            start_time: parseFloat(format.start_time || "0"),
            duration: format.duration || 0,
          });
        }
      });
    });
  }
}
