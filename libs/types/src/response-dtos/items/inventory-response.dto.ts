import { ApiProperty } from "@nestjs/swagger";
import { ProfileItemResponseDto } from "./profile-items-response.dto";
import { GetItemsInShopResponseDto } from "./get-items-response.dto";

export class InventoryResponseDto extends ProfileItemResponseDto {
  @ApiProperty({
    type: GetItemsInShopResponseDto,
  })
  item: GetItemsInShopResponseDto;
}
