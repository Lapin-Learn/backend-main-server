import { IsEnum, IsNotEmpty } from "class-validator";
import { RegisterUserDto } from "./register-user.dto";
import { AccountRoleEnum } from "@app/types/enums";

export class CreateUserDto extends RegisterUserDto {
  @IsNotEmpty({ message: "Username is required" })
  username: string;

  @IsEnum(AccountRoleEnum, { message: "Role is required as admin, learner, or expert" })
  role: AccountRoleEnum;
}
