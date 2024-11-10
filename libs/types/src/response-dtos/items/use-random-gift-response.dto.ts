import { ApiProperty } from "@nestjs/swagger";
import { GetItemsInShopResponseDto } from "./get-items-response.dto";
import { RandomGiftType } from "@app/types/enums";

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
