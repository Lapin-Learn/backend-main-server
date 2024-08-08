import { IsNotEmpty } from "class-validator";
import { RegisterUserDto } from "./register-user.dto";

export class CreateUserDto extends RegisterUserDto {
  @IsNotEmpty({ message: "Username is required" })
  username: string;
}
