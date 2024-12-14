import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterUserDto {
  @ApiProperty({ example: "example@gmail.com" })
  @IsEmail({}, { message: "Invalid email" })
  email: string;

  @ApiProperty({ example: "123456789" })
  @IsNotEmpty()
  password: string;
}
