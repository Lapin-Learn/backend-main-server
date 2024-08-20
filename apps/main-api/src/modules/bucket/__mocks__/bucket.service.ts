import { createMockBucket, mockDeletedValue, mockPresignedUrl } from "../test/mocks";

export const BucketService = jest.fn().mockImplementation(() => {
  const bucket = createMockBucket();

  return {
    bucket,
    getPresignedUploadUrl: jest.fn().mockResolvedValue({ id: bucket.id, url: mockPresignedUrl }),
    getPresignedDownloadUrl: jest.fn().mockResolvedValue(mockPresignedUrl),
    deleteFile: jest.fn().mockResolvedValue({ affected: mockDeletedValue.affected }),
    uploadConfirmation: jest.fn().mockResolvedValue({ id: bucket.id, name: bucket.name }),
    getPresignedUploadUrlForUpdate: jest.fn().mockResolvedValue({ id: bucket.id, url: mockPresignedUrl }),
  };
});
