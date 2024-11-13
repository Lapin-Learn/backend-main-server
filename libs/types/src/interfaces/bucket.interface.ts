import { BucketPermissionsEnum } from "../enums";
import { BucketUploadStatusEnum } from "../enums/bucket-upload-status.enum";

export interface IBucket {
  id: string;
  name: string;
  owner: string;
  permission: BucketPermissionsEnum;
  createdAt: Date;
  updatedAt: Date;
  uploadStatus: BucketUploadStatusEnum;
}
