import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class UseItemDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  itemId: string;
}
