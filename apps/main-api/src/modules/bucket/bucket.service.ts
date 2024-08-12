import { ConfirmUploadDto, UpdateFileDto, UploadFileDto } from "@app/types/dtos";
import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectS3, S3 } from "nestjs-s3";
import { Bucket } from "@app/database/entities";
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ICurrentUser } from "@app/types/interfaces";
import { BucketPermissionsEnum, BucketUploadStatusEnum } from "@app/types/enums";

@Injectable()
export class BucketService {
  private logger = new Logger(this.constructor.name);
  private bucketName: string = "";

  constructor(
    @InjectS3() private readonly s3: S3,
    private readonly configService: ConfigService
  ) {
    this.bucketName = this.configService.get("BUCKET_NAME");
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

      if (data.permission === BucketPermissionsEnum.PRIVATE && data.owner !== user.userId && user.role !== "admin") {
        throw new UnauthorizedException("Unauthorized access");
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileId,
        ResponseContentDisposition: `inline; filename=${data.name}`,
      });

      return getSignedUrl(this.s3, command, { expiresIn: 3600 });
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

      if (data.permission === BucketPermissionsEnum.PRIVATE && data.owner !== user.userId && user.role !== "admin") {
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
}
