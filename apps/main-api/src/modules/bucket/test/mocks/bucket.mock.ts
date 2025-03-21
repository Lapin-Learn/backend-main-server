import { Bucket } from "@app/database";
import { randomUUID } from "crypto";
import { BucketPermissionsEnum, BucketUploadStatusEnum } from "@app/types/enums";
import { learner } from "./learner.mock";

export const createMockBucket = (overrides: Partial<Bucket> = {}): Bucket => ({
  id: randomUUID(),
  name: "test.txt",
  owner: learner.userId,
  permission: BucketPermissionsEnum.PUBLIC,
  createdAt: new Date(),
  updatedAt: new Date(),
  uploadStatus: BucketUploadStatusEnum.PENDING,
  url: "https://google.com",

  hasId: jest.fn(),
  save: jest.fn().mockResolvedValue(this),
  remove: jest.fn().mockResolvedValue(this),
  softRemove: jest.fn().mockResolvedValue(this),
  recover: jest.fn().mockResolvedValue(this),
  reload: jest.fn().mockResolvedValue(this),

  ...overrides,
});
