import { ActionEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({ example: "test@exampple.com" })
  email: string;

  @ApiProperty({ example: "123456" })
  otp: string;

  @ApiProperty({ example: ActionEnum.VERIFY_MAIL })
  @IsEnum(ActionEnum, { message: "Invalid action name" })
  action: ActionEnum;
}
