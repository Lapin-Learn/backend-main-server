import { IsNotEmpty } from "class-validator";

export class FcmTokenDto {
  @IsNotEmpty({ message: "Token is required" })
  token: string;
}
