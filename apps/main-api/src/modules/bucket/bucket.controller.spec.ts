import { Test, TestingModule } from "@nestjs/testing";
import { BucketController } from "./bucket.controller";
import { BucketService } from "./bucket.service";
import { ConfigService } from "@nestjs/config";
import { AccountRoleEnum, BucketPermissionsEnum, BucketUploadStatusEnum } from "@app/types/enums";
import { randomUUID } from "crypto";
import { ICurrentUser } from "@app/types/interfaces";
import { Bucket } from "@app/database";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Inspiration from https://stackoverflow.com/a/68868511
const mS3Instance = {
  send: jest.fn(),
};

jest.mock("@aws-sdk/client-s3", () => ({
  S3: jest.fn().mockImplementation(() => mS3Instance),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  HeadObjectCommand: jest.fn(),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

// Data
const mockPresignedUrl = "https://google.com";

const learner: ICurrentUser = {
  userId: randomUUID(),
  role: AccountRoleEnum.LEARNER,
};

const expert: ICurrentUser = {
  userId: randomUUID(),
  role: AccountRoleEnum.EXPERT,
};

const admin: ICurrentUser = {
  userId: randomUUID(),
  role: AccountRoleEnum.ADMIN,
};

const createMockBucket = (overrides: Partial<Bucket> = {}): Bucket => ({
  id: randomUUID(),
  name: "test.txt",
  owner: learner.userId,
  permission: BucketPermissionsEnum.PUBLIC,
  createdAt: new Date(),
  updatedAt: new Date(),
  uploadStatus: BucketUploadStatusEnum.PENDING,

  hasId: jest.fn(),
  save: jest.fn().mockResolvedValue(this),
  remove: jest.fn().mockResolvedValue(this),
  softRemove: jest.fn().mockResolvedValue(this),
  recover: jest.fn().mockResolvedValue(this),
  reload: jest.fn().mockResolvedValue(this),

  ...overrides,
});

describe("BucketController", () => {
  const S3_PROVIDER_NAME = "default_S3ModuleConnectionToken";
  let bucketController: BucketController;

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
          useFactory: () => mS3Instance,
        },
      ],
    }).compile();

    bucketController = app.get<BucketController>(BucketController);

    jest.resetAllMocks();
  });

  describe("bucket", () => {
    it("Test getUploadPresignedUrl", async () => {
      const bucket = createMockBucket();

      // Mock the Bucket.save method
      jest.spyOn(Bucket, "save").mockResolvedValue(bucket);

      // Mock the getSignedUrl function
      (getSignedUrl as jest.Mock).mockResolvedValue(mockPresignedUrl);

      // Test
      await expect(bucketController.getPresignedUploadUrl(learner, bucket)).resolves.toEqual({
        id: bucket.id,
        url: mockPresignedUrl,
      });
    });

    it("Test getDownloadPresignedUrl", async () => {
      // Mock the getSignedUrl function
      (getSignedUrl as jest.Mock).mockResolvedValue(mockPresignedUrl);

      // Success case
      let bucket = createMockBucket({ uploadStatus: BucketUploadStatusEnum.UPLOADED });
      jest.spyOn(Bucket, "findOne").mockResolvedValue(bucket);
      await expect(bucketController.getPresignedDownloadUrl(learner, bucket.id)).resolves.toEqual({
        url: mockPresignedUrl,
      });

      // File is not uploaded
      bucket = createMockBucket();
      jest.spyOn(Bucket, "findOne").mockResolvedValue(bucket);
      await expect(bucketController.getPresignedDownloadUrl(learner, bucket.id)).rejects.toThrow("File not found");

      // Private file access
      bucket = createMockBucket({
        permission: BucketPermissionsEnum.PRIVATE,
        uploadStatus: BucketUploadStatusEnum.UPLOADED,
      });
      jest.spyOn(Bucket, "findOne").mockResolvedValue(bucket);
      await expect(bucketController.getPresignedDownloadUrl(expert, bucket.id)).rejects.toThrow("Unauthorized access");
      await expect(bucketController.getPresignedDownloadUrl(admin, bucket.id)).resolves.toEqual({
        url: mockPresignedUrl,
      });

      // File not found
      jest.spyOn(Bucket, "findOne").mockResolvedValue(null);
      await expect(bucketController.getPresignedDownloadUrl(learner, bucket.id)).rejects.toThrow("File not found");
    });

    it("Test deleteFile", async () => {
      const bucket = createMockBucket();
      jest.spyOn(Bucket, "delete").mockResolvedValue({
        raw: [],
        affected: 1,
      });

      // Success case
      jest.spyOn(Bucket, "findOne").mockResolvedValue(bucket);
      await expect(bucketController.deleteFile(learner, bucket.id)).resolves.toEqual({
        affected: 1,
      });

      // Delete access
      await expect(bucketController.deleteFile(expert, bucket.id)).rejects.toThrow("Unauthorized access");
      await expect(bucketController.deleteFile(admin, bucket.id)).resolves.toEqual({
        affected: 1,
      });

      // File not found
      jest.spyOn(Bucket, "findOne").mockResolvedValue(null);
      await expect(bucketController.deleteFile(learner, bucket.id)).rejects.toThrow("File not found");
    });
  });

  it("Test uploadConfirmation", async () => {
    const bucket = createMockBucket({ uploadStatus: BucketUploadStatusEnum.UPLOADED });
    jest.spyOn(Bucket, "findOne").mockResolvedValue(bucket);

    // Success case
    await expect(bucketController.uploadConfirmation(learner, { id: bucket.id })).resolves.toEqual({
      id: bucket.id,
      name: bucket.name,
    });

    // Access control
    await expect(bucketController.uploadConfirmation(expert, { id: bucket.id })).rejects.toThrow("Unauthorized access");

    // File is not uploaded to bucket
    (mS3Instance.send as jest.Mock).mockRejectedValue(new Error("File is not uploaded"));
    await expect(bucketController.uploadConfirmation(learner, { id: bucket.id })).rejects.toThrow(
      "File is not uploaded"
    );

    // File not found
    (mS3Instance.send as jest.Mock).mockReset();
    jest.spyOn(Bucket, "findOne").mockResolvedValue(null);
    expect(bucketController.uploadConfirmation(learner, { id: bucket.id })).rejects.toThrow("File not found");
  });

  it("Test getPresignedUploadUrlForUpdate", async () => {
    const bucket = createMockBucket();

    // Mock the Bucket.save method
    jest.spyOn(Bucket, "findOne").mockResolvedValue(bucket);

    // Mock the getSignedUrl function
    (getSignedUrl as jest.Mock).mockResolvedValue(mockPresignedUrl);

    // Success case
    await expect(
      bucketController.getPresignedUploadUrlForUpdate(
        learner,
        {
          name: bucket.name,
          permission: bucket.permission,
        },
        bucket.id
      )
    ).resolves.toEqual({
      id: bucket.id,
      url: mockPresignedUrl,
    });

    // Access control
    await expect(
      bucketController.getPresignedUploadUrlForUpdate(
        expert,
        {
          name: bucket.name,
          permission: bucket.permission,
        },
        bucket.id
      )
    ).rejects.toThrow("Unauthorized access");
  });
});
