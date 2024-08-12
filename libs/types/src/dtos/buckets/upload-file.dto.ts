import { BucketPermissionsEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UploadFileDto {
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Filename is required" })
  @ApiProperty({
    example: "file.jpg",
  })
  name: string;

  @IsOptional()
  @IsEnum(BucketPermissionsEnum, {
    message: `Permission must be one of the following values: ${Object.values(BucketPermissionsEnum).join(", ")}`,
  })
  @ApiProperty({
    enum: BucketPermissionsEnum,
    default: BucketPermissionsEnum.PUBLIC,
  })
  permission: BucketPermissionsEnum;
}
