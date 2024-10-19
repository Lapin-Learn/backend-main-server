import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LogInWithProviderDto {
  @ApiProperty({ example: "token" })
  @IsNotEmpty({ message: "Credential is required" })
  credential: string;

  @ApiProperty({ example: "google" })
  @IsNotEmpty({ message: "Provider is required" })
  provider: string;
}
