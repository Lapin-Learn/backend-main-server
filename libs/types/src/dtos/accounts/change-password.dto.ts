import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
  @ApiProperty({ example: "12345678" })
  oldPassword: string;

  @ApiProperty({ example: "12345678" })
  newPassword: string;
}
