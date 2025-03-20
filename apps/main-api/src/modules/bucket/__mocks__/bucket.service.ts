import { createMockBucket, mockDeletedValue, mockPresignedUrl } from "../test/mocks";

export class BucketService {
  bucket = createMockBucket();
  getPresignedUploadUrl = jest.fn().mockResolvedValue({ id: this.bucket.id, url: mockPresignedUrl });
  getPresignedDownloadUrl = jest.fn().mockResolvedValue(mockPresignedUrl);
  deleteFile = jest.fn().mockResolvedValue({ affected: mockDeletedValue.affected });
  uploadConfirmation = jest.fn().mockResolvedValue({ id: this.bucket.id, name: this.bucket.name });
  getPresignedUploadUrlForUpdate = jest.fn().mockResolvedValue({ id: this.bucket.id, url: mockPresignedUrl });
}
