import { ConfirmUploadDto, UpdateFileDto, UploadFileDto } from "@app/types/dtos";
import { BadRequestException, HttpStatus, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectS3, S3 } from "nestjs-s3";
import { Bucket } from "@app/database/entities";
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IBucket, ICurrentUser } from "@app/types/interfaces";
import { AccountRoleEnum, BucketPermissionsEnum, BucketUploadStatusEnum } from "@app/types/enums";
import _ from "lodash";
import { AxiosInstance } from "axios";
import { genericHttpConsumer } from "@app/utils/axios";
import fs from "fs";
import { createExpressMulterFile } from "@app/utils/audio";
import * as tmp from "tmp";
import { RedisService } from "@app/shared-modules/redis";
import { FILE_ID_URL } from "@app/types/constants";
import { getKeysFromTemplate } from "@app/utils/keys";

@Injectable()
export class BucketService {
  private logger = new Logger(this.constructor.name);
  private bucketName: string = "";
  private readonly httpService: AxiosInstance;

  constructor(
    @InjectS3() private readonly s3: S3,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) {
    this.bucketName = this.configService.get("BUCKET_NAME");
    this.httpService = genericHttpConsumer();
  }

  async getPresignedUploadUrl(user: ICurrentUser, body: UploadFileDto) {
    try {
      const { name } = body;
      const data = await Bucket.save({
        name,
        owner: user.userId,
        permission: body.permission ? body.permission : BucketPermissionsEnum.PUBLIC,
      });
      const command = new PutObjectCommand({ Bucket: this.bucketName, Key: `${data.id}` });
      return {
        id: data.id,
        url: await getSignedUrl(this.s3, command, { expiresIn: 3600 }),
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getPresignedDownloadUrl(user: ICurrentUser, fileId: string) {
    try {
      const data = await Bucket.findOne({ where: { id: fileId } });

      if (!data || data.uploadStatus === BucketUploadStatusEnum.PENDING) {
        throw new BadRequestException("File not found");
      }

      if (
        data.permission === BucketPermissionsEnum.PRIVATE &&
        data.owner !== user.userId &&
        user.role !== AccountRoleEnum.ADMIN
      ) {
        throw new UnauthorizedException("Unauthorized access");
      }

      return data.url;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async deleteFile(user: ICurrentUser, fileId: string) {
    try {
      const data = await Bucket.findOne({ where: { id: fileId } });

      if (!data) {
        throw new BadRequestException("File not found");
      }

      if (data.owner !== user.userId && user.role !== AccountRoleEnum.ADMIN) {
        throw new UnauthorizedException("Unauthorized access");
      }

      const deletedData = await Bucket.delete({ id: fileId });

      if (deletedData.affected) {
        const command = new DeleteObjectCommand({ Bucket: this.bucketName, Key: fileId });
        await this.s3.send(command);
      }

      return { affected: deletedData.affected };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async uploadConfirmation(user: ICurrentUser, body: ConfirmUploadDto) {
    try {
      const data = await Bucket.findOne({ where: { id: body.id } });

      if (!data) {
        throw new BadRequestException("File not found");
      }

      if (data.owner !== user.userId) {
        throw new UnauthorizedException("Unauthorized access");
      }

      try {
        const command = new HeadObjectCommand({ Bucket: this.bucketName, Key: body.id });
        await this.s3.send(command);
      } catch (error) {
        throw new BadRequestException("File is not uploaded");
      }

      data.uploadStatus = BucketUploadStatusEnum.UPLOADED;
      await data.save();

      const cachedKeyUrl = getKeysFromTemplate(FILE_ID_URL, { fileId: data.id });
      await this.redisService.delete(cachedKeyUrl);

      return { id: data.id, name: data.name };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getPresignedUploadUrlForUpdate(user: ICurrentUser, body: UpdateFileDto & { id: string }) {
    try {
      const data = await Bucket.findOne({ where: { id: body.id } });
      if (!data) {
        throw new BadRequestException("File not found");
      }

      if (data.owner !== user.userId) {
        throw new UnauthorizedException("Unauthorized access");
      }

      data.name = body.name ? body.name : data.name;
      data.permission = body.permission ? body.permission : data.permission;
      await data.save();

      const command = new PutObjectCommand({ Bucket: this.bucketName, Key: data.id });
      return {
        id: data.id,
        url: await getSignedUrl(this.s3, command, { expiresIn: 3600 }),
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getPresignedDownloadUrlForAfterLoad(entity: IBucket) {
    try {
      if (_.isNil(entity.id)) {
        return null;
      }

      const key = getKeysFromTemplate(FILE_ID_URL, { fileId: entity.id });

      let signedUrl: string;
      signedUrl = await this.redisService.get(key);

      if (signedUrl) {
        return signedUrl;
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: entity.id,
        ResponseContentDisposition: `inline; filename=${entity.name}`,
      });

      signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
      await this.redisService.set(key, signedUrl, 3300);
      return signedUrl;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
  async uploadFile(fileName: string, file: Express.Multer.File, user: ICurrentUser) {
    const uploadedFile: UploadFileDto = {
      name: fileName,
      permission: BucketPermissionsEnum.PUBLIC,
    };
    const presignedUrl = await this.getPresignedUploadUrl(user, uploadedFile);
    const res = await this.httpService.put(presignedUrl.url, Buffer.from(file.buffer), {
      headers: {
        "Content-Type": file.mimetype,
      },
    });
    if (res.status !== HttpStatus.OK) {
      this.logger.error("Error upload file: ", res.data);
      return false;
    }
    const data = await this.uploadConfirmation(user, { id: presignedUrl.id });
    return data;
  }

  async uploadAvatarFromLink(fileName: string, url: string, user: ICurrentUser) {
    try {
      const response = await this.httpService.get(url, {
        method: "GET",
        responseType: "arraybuffer",
      });
      const tempFile = tmp.fileSync({ postfix: ".jpg" });
      fs.writeFileSync(tempFile.name, response.data);

      const file = createExpressMulterFile(tempFile.name, fileName, "image/jpeg");
      const uploadResult = await this.uploadFile(fileName, file, user);
      const status = uploadResult !== false;
      tempFile.removeCallback();
      return status;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }
}
