import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class FcmTokenDto {
  @IsOptional()
  @ApiProperty()
  token: string | null;
}
