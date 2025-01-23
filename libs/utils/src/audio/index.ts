import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";

import { Logger } from "@nestjs/common";
import { Readable } from "stream";

export function createExpressMulterFile(
  tempFilePath: string,
  originalName: string,
  mimeType: string
): Express.Multer.File {
  const fileBuffer = fs.readFileSync(tempFilePath);

  return {
    fieldname: "file",
    originalname: originalName,
    encoding: "7bit",
    mimetype: mimeType,
    buffer: fileBuffer,
    size: fileBuffer.length,
    stream: Readable.from(fileBuffer),
    destination: null,
    filename: tempFilePath,
    path: tempFilePath,
  };
}

export async function mergeAudioFiles(
  audioFiles: string[],
  outputPath: string
): Promise<{ start: number; duration: number; end: number }[]> {
  try {
    const audioTimestamps: { file: string; start: number; duration: number; end: number }[] = [];
    let currentStartTime = 0;

    for (const audioFile of audioFiles) {
      const metadata = await getAudioMetadata(audioFile);
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
          Logger.error("Error during audio merging:", err);
          reject(err);
        })
        .on("end", () => {
          Logger.log("Audio files merged successfully.");
          resolve();
        })
        .mergeToFile(outputPath, "./tmp/");
    });

    return audioTimestamps.map(({ start, duration, end }) => ({ start, duration, end }));
  } catch (error) {
    Logger.error("Error in mergeAudioFiles:", error);
    throw error;
  }
}

export async function getAudioMetadata(filePath: string): Promise<{ start_time: number; duration: number }> {
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
