import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { Bucket } from "@app/database";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mockPresignedUrl } from "./mocks/presigned-url.mock";
import { BucketService } from "../bucket.service";
import { S3_PROVIDER_NAME } from "./constants/s3-provider.const";
import { PutObjectCommand, GetObjectCommand, S3, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { admin, createMockBucket, expert, learner } from "./mocks";
import { BadRequestException } from "@nestjs/common";
import { BucketPermissionsEnum, BucketUploadStatusEnum } from "@app/types/enums";
import { mockDeletedValue } from "./mocks/deleted-value.mock";

describe("BucketService", () => {
  let bucketService: BucketService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    bucketService = app.get<BucketService>(BucketService);
  });

  it("should be defined", () => {
    expect(bucketService).toBeDefined();
  });

  describe("Test getPresignedUploadUrl", () => {
    const bucket = createMockBucket();

    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(Bucket, "save").mockResolvedValue(bucket);
      (getSignedUrl as jest.Mock).mockResolvedValue(mockPresignedUrl);
    });

    it("getPresignedUploadUrl should be defined", () => {
      expect(bucketService.getPresignedUploadUrl).toBeDefined();
    });

    it("should return a presigned URL", async () => {
      const response = bucketService.getPresignedUploadUrl(learner, bucket);
      await expect(response).resolves.toEqual({
        id: bucket.id,
        url: mockPresignedUrl,
      });
    });

    it("should throw an error because of Bucket.save", async () => {
      jest.spyOn(Bucket, "save").mockRejectedValue(new Error());
      const response = bucketService.getPresignedUploadUrl(learner, bucket);
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because of PutObjectCommand", async () => {
      (PutObjectCommand as unknown as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      const response = bucketService.getPresignedUploadUrl(learner, bucket);
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because of getSignedUrl", async () => {
      (getSignedUrl as jest.Mock).mockRejectedValue(new Error());
      const response = bucketService.getPresignedUploadUrl(learner, bucket);
      await expect(response).rejects.toThrow(BadRequestException);
    });
  });

  describe("Test getPresignedDownloadUrl", () => {
    const bucket = createMockBucket({ uploadStatus: BucketUploadStatusEnum.UPLOADED });
    const pendingBucket = createMockBucket({ id: bucket.id });
    const privateBucket = createMockBucket({
      id: bucket.id,
      permission: BucketPermissionsEnum.PRIVATE,
      uploadStatus: BucketUploadStatusEnum.UPLOADED,
    });

    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(Bucket, "findOne").mockResolvedValue(bucket);
      (getSignedUrl as jest.Mock).mockResolvedValue(mockPresignedUrl);
    });

    it("getPresignedDownloadUrl should be defined", () => {
      expect(bucketService.getPresignedDownloadUrl).toBeDefined();
    });

    it("should return a presigned URL", async () => {
      const response = bucketService.getPresignedDownloadUrl(learner, bucket.id);
      await expect(response).resolves.toEqual(mockPresignedUrl);
    });

    it("should throw an error because of Bucket.findOne", async () => {
      jest.spyOn(Bucket, "findOne").mockRejectedValue(new Error());
      const response = bucketService.getPresignedDownloadUrl(learner, bucket.id);
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because file not found", async () => {
      jest.spyOn(Bucket, "findOne").mockResolvedValue(null);
      const response = bucketService.getPresignedDownloadUrl(learner, bucket.id);
      await expect(response).rejects.toThrow(BadRequestException);

      jest.spyOn(Bucket, "findOne").mockResolvedValue(pendingBucket);
      const response2 = bucketService.getPresignedDownloadUrl(learner, bucket.id);
      await expect(response2).rejects.toThrow(BadRequestException);
    });

    it("validate authorized access", async () => {
      jest.spyOn(Bucket, "findOne").mockResolvedValue(privateBucket);

      const response = bucketService.getPresignedDownloadUrl(expert, bucket.id);
      await expect(response).rejects.toThrow(BadRequestException);

      const response2 = bucketService.getPresignedDownloadUrl(admin, bucket.id);
      await expect(response2).resolves.toEqual(mockPresignedUrl);
    });

    it("should throw an error because of GetObjectCommand", async () => {
      (GetObjectCommand as unknown as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      const response = bucketService.getPresignedDownloadUrl(learner, bucket.id);
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because of getSignedUrl", async () => {
      (getSignedUrl as jest.Mock).mockRejectedValue(new Error());
      const response = bucketService.getPresignedDownloadUrl(learner, bucket.id);
      await expect(response).rejects.toThrow(BadRequestException);
    });
  });

  describe("Test deleteFile", () => {
    const bucket = createMockBucket({ uploadStatus: BucketUploadStatusEnum.UPLOADED });

    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(Bucket, "findOne").mockResolvedValue(bucket);
      jest.spyOn(Bucket, "delete").mockResolvedValue(mockDeletedValue);
    });

    it("deleteFile should be defined", () => {
      expect(bucketService.deleteFile).toBeDefined();
    });

    it("should delete a file", async () => {
      const response = bucketService.deleteFile(learner, bucket.id);
      await expect(response).resolves.toEqual({ affected: 1 });
    });

    it("should throw an error because of Bucket.findOne", async () => {
      jest.spyOn(Bucket, "findOne").mockRejectedValue(new Error());
      const response = bucketService.deleteFile(learner, bucket.id);
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because file not found", async () => {
      jest.spyOn(Bucket, "findOne").mockResolvedValue(null);
      const response = bucketService.deleteFile(learner, bucket.id);
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("validate authorized access", async () => {
      const response = bucketService.deleteFile(expert, bucket.id);
      await expect(response).rejects.toThrow(BadRequestException);

      const response2 = bucketService.deleteFile(admin, bucket.id);
      await expect(response2).resolves.toEqual({ affected: 1 });
    });

    it("should throw an error because of DeleteObjectCommand", async () => {
      (DeleteObjectCommand as unknown as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      const response = bucketService.deleteFile(learner, bucket.id);
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because of S3.send", async () => {
      (S3 as any).send = jest.fn().mockRejectedValue(new Error());
      const response = bucketService.deleteFile(learner, bucket.id);
      await expect(response).rejects.toThrow(BadRequestException);
    });
  });

  describe("Test uploadConfirmation", () => {
    const bucket = createMockBucket();

    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(Bucket, "findOne").mockResolvedValue(bucket);
      jest.spyOn(Bucket, "save").mockResolvedValue(bucket);
    });

    it("uploadConfirmation should be defined", () => {
      expect(bucketService.uploadConfirmation).toBeDefined();
    });

    it("should confirm the upload", async () => {
      const response = bucketService.uploadConfirmation(learner, { id: bucket.id });
      await expect(response).resolves.toEqual({ id: bucket.id, name: bucket.name });
    });

    it("should throw an error because of Bucket.findOne", async () => {
      jest.spyOn(Bucket, "findOne").mockRejectedValue(new Error());
      const response = bucketService.uploadConfirmation(learner, { id: bucket.id });
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because file not found", async () => {
      jest.spyOn(Bucket, "findOne").mockResolvedValue(null);
      const response = bucketService.uploadConfirmation(learner, { id: bucket.id });
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("validate authorized access", async () => {
      const response = bucketService.uploadConfirmation(expert, { id: bucket.id });
      await expect(response).rejects.toThrow(BadRequestException);

      const response2 = bucketService.uploadConfirmation(admin, { id: bucket.id });
      await expect(response2).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because of HeadObjectCommand", async () => {
      (HeadObjectCommand as unknown as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      const response = bucketService.uploadConfirmation(learner, { id: bucket.id });
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because of S3.send", async () => {
      (S3 as any).send = jest.fn().mockRejectedValue(new Error());
      const response = bucketService.uploadConfirmation(learner, { id: bucket.id });
      await expect(response).rejects.toThrow(BadRequestException);
    });
  });

  describe("Test getPresignedUploadUrlForUpdate", () => {
    const bucket = createMockBucket();
    const updatedBucket = createMockBucket({ id: bucket.id, name: "new.txt" });

    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(Bucket, "findOne").mockResolvedValue(bucket);
      jest.spyOn(Bucket, "save").mockResolvedValue(updatedBucket);
      (getSignedUrl as jest.Mock).mockResolvedValue(mockPresignedUrl);
    });

    it("getPresignedUploadUrlForUpdate should be defined", () => {
      expect(bucketService.getPresignedUploadUrlForUpdate).toBeDefined();
    });

    it("should return a presigned URL", async () => {
      const response = bucketService.getPresignedUploadUrlForUpdate(learner, updatedBucket);
      await expect(response).resolves.toEqual({ id: bucket.id, url: mockPresignedUrl });
    });

    it("should throw an error because of Bucket.findOne", async () => {
      jest.spyOn(Bucket, "findOne").mockRejectedValue(new Error());
      const response = bucketService.getPresignedUploadUrlForUpdate(learner, updatedBucket);
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because file not found", async () => {
      jest.spyOn(Bucket, "findOne").mockResolvedValue(null);
      const response = bucketService.getPresignedUploadUrlForUpdate(learner, updatedBucket);
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("validate authorized access", async () => {
      const response = bucketService.getPresignedUploadUrlForUpdate(expert, updatedBucket);
      await expect(response).rejects.toThrow(BadRequestException);

      const response2 = bucketService.getPresignedUploadUrlForUpdate(admin, updatedBucket);
      await expect(response2).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because of PutObjectCommand", async () => {
      (PutObjectCommand as unknown as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      const response = bucketService.getPresignedUploadUrlForUpdate(learner, updatedBucket);
      await expect(response).rejects.toThrow(BadRequestException);
    });

    it("should throw an error because of getSignedUrl", async () => {
      (getSignedUrl as jest.Mock).mockRejectedValue(new Error());
      const response = bucketService.getPresignedUploadUrlForUpdate(learner, updatedBucket);
      await expect(response).rejects.toThrow(BadRequestException);
    });
  });
});
