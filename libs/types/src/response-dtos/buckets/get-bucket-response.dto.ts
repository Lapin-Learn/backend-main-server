import { BucketPermissionsEnum, BucketUploadStatusEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";

export class BucketResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  owner: string;

  @ApiProperty({
    type: "string",
    enum: BucketPermissionsEnum,
  })
  permission: BucketPermissionsEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    type: "string",
    enum: BucketUploadStatusEnum,
  })
  uploadStatus: BucketUploadStatusEnum;
}
