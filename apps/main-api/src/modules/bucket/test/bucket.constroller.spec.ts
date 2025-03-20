import { Test, TestingModule } from "@nestjs/testing";
import { BucketController } from "../bucket.controller";
import { BucketService } from "../bucket.service";
import { S3_PROVIDER_NAME } from "./constants/s3-provider.const";
import { S3 } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { learner, mockPresignedUrl } from "./mocks";
import { BadRequestException } from "@nestjs/common";
import { Bucket } from "@app/database";
import { RedisService } from "@app/shared-modules/redis";
import MockRedisService from "@app/shared-modules/redis/__mocks__/redis.service";

jest.mock("../bucket.service");
describe("BucketController", () => {
  let bucketController: BucketController;
  let bucketService: BucketService;
  let bucket: Bucket;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BucketController],
      providers: [
        BucketService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: S3_PROVIDER_NAME,
          useFactory: () => S3,
        },
        {
          provide: RedisService,
          useClass: MockRedisService,
        },
      ],
    }).compile();

    bucketController = app.get<BucketController>(BucketController);
    bucketService = app.get<BucketService>(BucketService);
    bucket = (bucketService as any).bucket;
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(bucketController).toBeDefined();
    expect(bucketService).toBeDefined();
  });

  describe("getPresignedUploadUrl", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return presigned URL", async () => {
      await expect(bucketController.getPresignedUploadUrl(learner, bucket)).resolves.toEqual({
        id: bucket.id,
        url: mockPresignedUrl,
      });
    });

    it("should throw an error", async () => {
      (bucketService.getPresignedUploadUrl as any).mockRejectedValue(new BadRequestException());
      await expect(bucketController.getPresignedUploadUrl(learner, bucket)).rejects.toThrow(BadRequestException);
    });
  });

  describe("getPresignedDownloadUrl", () => {
    it("should return presigned URL", async () => {
      await expect(bucketController.getPresignedDownloadUrl(learner, bucket.id)).resolves.toEqual({
        url: mockPresignedUrl,
      });
    });

    it("should throw an error", async () => {
      (bucketService.getPresignedDownloadUrl as any).mockRejectedValue(new BadRequestException());
      await expect(bucketController.getPresignedDownloadUrl(learner, bucket.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe("deleteFile", () => {
    it("should delete file", async () => {
      await expect(bucketController.deleteFile(learner, bucket.id)).resolves.toEqual({ affected: 1 });
    });

    it("should throw an error", async () => {
      (bucketService.deleteFile as any).mockRejectedValue(new BadRequestException());
      await expect(bucketController.deleteFile(learner, bucket.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe("uploadConfirmation", () => {
    it("should confirm upload", async () => {
      await expect(bucketController.uploadConfirmation(learner, bucket)).resolves.toEqual({
        id: bucket.id,
        name: bucket.name,
      });
    });

    it("should throw an error", async () => {
      (bucketService.uploadConfirmation as any).mockRejectedValue(new BadRequestException());
      await expect(bucketController.uploadConfirmation(learner, bucket)).rejects.toThrow(BadRequestException);
    });
  });

  describe("getPresignedUploadUrlForUpdate", () => {
    it("should return presigned URL", async () => {
      await expect(bucketController.getPresignedUploadUrlForUpdate(learner, bucket, bucket.id)).resolves.toEqual({
        id: bucket.id,
        url: mockPresignedUrl,
      });
    });

    it("should throw an error", async () => {
      (bucketService.getPresignedUploadUrlForUpdate as any).mockRejectedValue(new BadRequestException());
      await expect(bucketController.getPresignedUploadUrlForUpdate(learner, bucket, bucket.id)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
