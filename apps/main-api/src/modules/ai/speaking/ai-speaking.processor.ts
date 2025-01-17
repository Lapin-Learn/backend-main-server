import { Processor, WorkerHost } from "@nestjs/bullmq";
import { AISpeakingService } from "./ai-speaking.service";
import { Job } from "bullmq";
import { EVALUATE_SPEAKING_QUEUE, SPEAKING_FILE_PREFIX } from "@app/types/constants";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { EvaluateSpeakingData } from "@app/types/dtos/simulated-tests";
import * as fs from "fs";
import * as tmp from "tmp";
import ffmpeg from "fluent-ffmpeg";
import { getConstraints } from "@app/utils/pipes";
import { HttpStatus, Logger } from "@nestjs/common";
import { SkillTestSession } from "@app/database";
import { BucketPermissionsEnum, TestSessionStatusEnum } from "@app/types/enums";
import { BucketService } from "../../bucket/bucket.service";
import { UploadFileDto } from "@app/types/dtos";
import { genericHttpConsumer } from "@app/utils/axios";
import { AxiosInstance } from "axios";

@Processor(EVALUATE_SPEAKING_QUEUE)
export class AISpeakingConsumer extends WorkerHost {
  private readonly logger: Logger = new Logger(this.constructor.name);
  private readonly httpService: AxiosInstance;
  constructor(
    private readonly aiSpeakingService: AISpeakingService,
    private readonly bucketService: BucketService
  ) {
    super();
    this.httpService = genericHttpConsumer();
  }

  async process(job: Job): Promise<any> {
    try {
      const speakingData: EvaluateSpeakingData = plainToInstance(EvaluateSpeakingData, job.data);
      const errors = await validate(speakingData, { forbidNonWhitelisted: true });

      if (errors.length > 0) {
        const error = getConstraints(errors[0]);
        throw new Error(Object.keys(error)[0]);
      }

      const { speakingFiles, userResponse, sessionId, learner } = speakingData;

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
        r["timeStamp"] = audioSegments[index].end;
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

      const fileName = `${SPEAKING_FILE_PREFIX}-${sessionId}`;
      const file: UploadFileDto = {
        name: fileName,
        permission: BucketPermissionsEnum.PUBLIC,
      };
      const presignedUrl = await this.bucketService.getPresignedUploadUrl(learner, file);
      const response = await this.httpService.put(presignedUrl.url, mergedFile.buffer, {
        headers: {
          "Content-Type": mergedFile.mimetype,
        },
      });

      if (response.status === HttpStatus.OK) {
        await this.bucketService.uploadConfirmation(learner, { id: presignedUrl.id });
      }

      const evaluations = await this.aiSpeakingService.generateScore(sessionId, mergedFile, userResponse);
      for (const evaluation of evaluations) {
        const errors = await validate(evaluation);
        if (errors.length > 0) {
          this.logger.error("validation fail: ", errors);
        }
      }

      await SkillTestSession.save({
        id: sessionId,
        results: evaluations,
        responses: userResponse,
        estimatedBandScore: evaluations[evaluations.length - 1].criterias.getOverallScore(),
        status: TestSessionStatusEnum.FINISHED,
      });

      mergedTempFile.removeCallback();

      return;
    } catch (error) {
      this.logger.error(error);
      return;
    }
  }

  async mergeAudioFiles(
    audioFiles: string[],
    outputPath: string
  ): Promise<{ start: number; duration: number; end: number }[]> {
    try {
      const audioTimestamps: { file: string; start: number; duration: number; end: number }[] = [];
      let currentStartTime = 0;

      for (const audioFile of audioFiles) {
        const metadata = await this.getAudioMetadata(audioFile);
        audioTimestamps.push({
          file: audioFile,
          start: currentStartTime,
          duration: metadata.duration,
          end: currentStartTime + metadata.duration,
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
            this.logger.error("Error during audio merging:", err);
            reject(err);
          })
          .on("end", () => {
            this.logger.log("Audio files merged successfully.");
            resolve();
          })
          .mergeToFile(outputPath, "./tmp/");
      });

      return audioTimestamps.map(({ start, duration, end }) => ({ start, duration, end }));
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
