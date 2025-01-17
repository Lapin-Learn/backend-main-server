import { FIREBASE_APP_PROVIDER } from "@app/types/constants";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { App } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import path from "path";

@Injectable()
export class FirebaseStorageService {
  private readonly storage: Storage;
  private readonly logger: Logger = new Logger(this.constructor.name);
  private directory: string = "";
  constructor(
    @Inject(FIREBASE_APP_PROVIDER)
    private readonly app: App
  ) {
    this.storage = getStorage(this.app);
  }

  setDirectory(dir: string) {
    this.directory = dir;
  }

  async upload(file: Express.Multer.File, fileName: string) {
    const bucket = this.storage.bucket();
    const filePath = path.join(this.directory, fileName);
    const fileUpload = bucket.file(filePath);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        cacheControl: "public, max-age=3600",
      },
    });

    return new Promise((resolve, reject) => {
      stream.on("error", (error) => {
        this.logger.error("Error uploading file", error);
        reject(error);
      });

      stream.on("finish", () => {
        this.logger.log("File upload successfully");
        resolve("Upload successfully");
      });

      stream.end(file.buffer);
    });
  }

  async generateSignedUrl(fileName: string, expiresIn: number = 3600) {
    const bucket = this.storage.bucket();
    const filePath = path.join(this.directory, fileName);
    const file = bucket.file(filePath);
    try {
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + expiresIn * 1000,
      });
      this.logger.log("Generated signed URL");
      return url;
    } catch (err) {
      this.logger.error("Error generating signed URL", err);
      throw err;
    }
  }
}
