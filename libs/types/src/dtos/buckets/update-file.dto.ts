import { IsString } from "class-validator";
import { UploadFileDto } from "./upload-file.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateFileDto extends UploadFileDto {
  @IsString()
  @ApiProperty({
    example: "00000000-0000-0000-0000-000000000000",
  })
  id: string;
}
