import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FirebaseJwtAuthGuard } from "../../../guards";
import { ApiDefaultResponses, CurrentUser, Roles } from "../../../decorators";
import { ShopService } from "./shop.service";
import { AccountRoleEnum } from "@app/types/enums";
import { GetItemsInShopResponseDto, ProfileItemResponseDto } from "@app/types/response-dtos";
import { BuyItemDto } from "@app/types/dtos";
import { ICurrentUser } from "@app/types/interfaces";

@ApiTags("Shop and items")
@ApiBearerAuth()
@ApiDefaultResponses()
@Controller("shops")
@UseGuards(FirebaseJwtAuthGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @ApiOperation({ summary: "Get all items in shop" })
  @ApiOkResponse({ type: [GetItemsInShopResponseDto] })
  @Get()
  @Roles(AccountRoleEnum.LEARNER)
  async getItemsInShop() {
    return this.shopService.getItemsInShop();
  }

  @ApiOperation({ summary: "Buy an item from the shop" })
  @ApiOkResponse({ type: ProfileItemResponseDto })
  @Post("buy")
  @Roles(AccountRoleEnum.LEARNER)
  async buyItem(@CurrentUser() user: ICurrentUser, @Body() dto: BuyItemDto) {
    return this.shopService.buyItem(user, dto);
  }
}
