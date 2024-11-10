import { BucketPermissionsEnum, BucketUploadStatusEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";

export enum RandomGiftType {
  CARROTS = "carrots",
  ITEM = "item",
}

export class BucketResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  owner: string;

  @ApiProperty({
    type: "string",
    enum: BucketPermissionsEnum,
  })
  permission: BucketPermissionsEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    type: "string",
    enum: BucketUploadStatusEnum,
  })
  uploadStatus: BucketUploadStatusEnum;
}

export class GetItemsInShopResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({
    description: "Return the popular price of the item",
  })
  popular: string;

  @ApiProperty({
    type: Boolean,
  })
  isPopular: boolean;

  @ApiProperty({
    type: "object",
    additionalProperties: {
      type: "number",
    },
  })
  price: Record<string, number>;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  imageId: string;

  @ApiProperty({
    type: BucketResponseDto,
  })
  image: BucketResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UseRandomGiftCarrotsResponseDto {
  @ApiProperty({
    example: RandomGiftType.CARROTS,
  })
  type: RandomGiftType.CARROTS;

  @ApiProperty()
  value: number;
}

export class UseRandomGiftItemResponseDto {
  @ApiProperty({
    example: RandomGiftType.ITEM,
  })
  type: RandomGiftType.ITEM;

  @ApiProperty()
  value: GetItemsInShopResponseDto;
}
