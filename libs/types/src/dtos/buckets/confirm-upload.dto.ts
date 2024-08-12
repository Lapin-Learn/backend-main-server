import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ConfirmUploadDto {
  @IsString()
  @ApiProperty({
    example: "00000000-0000-0000-0000-000000000000",
  })
  id: string;
}
