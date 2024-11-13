import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsUUID, Min } from "class-validator";

export class BuyItemDto {
  @ApiProperty({
    example: "00000000-0000-0000-0000-000000000000",
  })
  @IsUUID(4, { message: "Item ID must be a valid UUID" })
  id: string;

  @ApiProperty({ example: 1 })
  @IsInt({ message: "Quantity must be an integer" })
  @Min(1, { message: "Quantity must be at least 1" })
  quantity: number;
}
