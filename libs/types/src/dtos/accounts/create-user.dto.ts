import { IsEnum, IsNotEmpty } from "class-validator";
import { RegisterUserDto } from "./register-user.dto";
import { AccountRoleEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto extends RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: "Username is required" })
  username: string;

  @ApiProperty({
    type: "enum",
    enum: AccountRoleEnum,
  })
  @IsEnum(AccountRoleEnum, { message: "Role is required as admin, learner, or expert" })
  role: AccountRoleEnum;
}
