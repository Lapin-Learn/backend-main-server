import { ActionEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({ example: "test@exampple.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "123456" })
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ example: ActionEnum.VERIFY_MAIL })
  @IsEnum(ActionEnum, { message: "Invalid action name" })
  action: ActionEnum;
}
