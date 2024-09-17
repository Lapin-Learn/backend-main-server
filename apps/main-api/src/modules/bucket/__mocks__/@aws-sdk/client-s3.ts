// Inspiration from https://stackoverflow.com/a/68868511
const S3 = {
  send: jest.fn(),
};
const PutObjectCommand = jest.fn();
const GetObjectCommand = jest.fn();
const DeleteObjectCommand = jest.fn();
const HeadObjectCommand = jest.fn();

export { S3, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand };
