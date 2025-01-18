import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CancelPaymentLinkDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  cancellationReason?: string;
}
