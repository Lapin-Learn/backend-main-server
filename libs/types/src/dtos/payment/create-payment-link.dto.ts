import { PaymentTypeEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";

export class CreatePaymentLinkDto {
  @IsNumber()
  @ApiProperty()
  quantity: number;

  @IsEnum(PaymentTypeEnum, { message: "Invalid payment type" })
  @ApiProperty({
    example: PaymentTypeEnum.CARROTS,
  })
  type: PaymentTypeEnum;

  @ApiProperty({
    example: "http://localhost:5173",
  })
  @IsString()
  redirectUrl: string;
}
