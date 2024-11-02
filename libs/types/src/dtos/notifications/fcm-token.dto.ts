import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class FcmTokenDto {
  @IsNotEmpty({ message: "Token is required" })
  @ApiProperty()
  token: string;
}
