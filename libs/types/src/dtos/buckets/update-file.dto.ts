import { IsString } from "class-validator";
import { UploadFileDto } from "./upload-file.dto";

export class UpdateFileDto extends UploadFileDto {
  @IsString()
  id: string;
}
