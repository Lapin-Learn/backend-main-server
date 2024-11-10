import { ProfileItemStatusEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";

export class ProfileItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  itemId: string;

  @ApiProperty()
  profileId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  expAt: Date;

  @ApiProperty()
  inUseQuantity: number;

  @ApiProperty({
    type: "string",
    enum: ProfileItemStatusEnum,
  })
  status: ProfileItemStatusEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
