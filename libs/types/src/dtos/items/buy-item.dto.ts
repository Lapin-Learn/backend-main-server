import { IsInt, IsUUID, Min } from "class-validator";

export class BuyItemDto {
  @IsUUID(4, { message: "Item ID must be a valid UUID" })
  id: string;

  @IsInt({ message: "Quantity must be an integer" })
  @Min(1, { message: "Quantity must be at least 1" })
  quantity: number;
}
