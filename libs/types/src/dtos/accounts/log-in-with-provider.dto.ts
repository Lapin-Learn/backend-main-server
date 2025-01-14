import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AdditionalInfo {
  @IsString()
  fullName: string;
}

export class LogInWithProviderDto {
  @ApiProperty({ example: "token" })
  @IsNotEmpty({ message: "Credential is required" })
  credential: string;

  @ApiProperty({ example: "google" })
  @IsNotEmpty({ message: "Provider is required" })
  provider: string;

  @IsOptional()
  @ValidateNested()
  additionalInfo: AdditionalInfo;
}
