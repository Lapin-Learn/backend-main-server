import { Body, Body, Controller, Get, Put, Post, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ShopService } from "./shop.service";
import { ApiBearerAuth, ApiOkResponse, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUser, Roles } from "../../decorators";
import { AccountRoleEnum } from "@app/types/enums";
import { GetItemsInShopResponseDto } from "./shop.type";
import { ICurrentUser } from "@app/types/interfaces";
import { UseItemDto } from "@app/types/dtos";
import { BuyItemDto } from "@app/types/dtos";
import { ICurrentUser } from "@app/types/interfaces";

@ApiTags("Shops")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@ApiResponse({ status: 400, description: "Bad request" })
@ApiResponse({ status: 401, description: "Unauthorized" })
@ApiResponse({ status: 403, description: "Forbidden" })
@ApiResponse({ status: 500, description: "Internal server error" })
@Controller("shops")
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @ApiOperation({ summary: "Get items in shop" })
  @Get()
  @ApiOkResponse({ type: [GetItemsInShopResponseDto] })
  @Roles(AccountRoleEnum.LEARNER)
  async getItemsInShop() {
    return this.shopService.getItemsInShop();
  }

  @ApiOperation({ summary: "Buy item" })
  @Post("buy")
  @ApiBody({ type: BuyItemDto })
  @ApiResponse({ status: 200, description: "Item bought successfully" })
  @Roles(AccountRoleEnum.LEARNER)
  async buyItem(@CurrentUser() user: ICurrentUser, @Body() dto: BuyItemDto) {
    return this.shopService.buyItem(user, dto);
  }

  @Put("use-item")
  @Roles(AccountRoleEnum.LEARNER)
  async useItemInInventory(@CurrentUser() user: ICurrentUser, @Body() payload: UseItemDto) {
    console.log(payload);
    return this.shopService.useItemInInventory(user, payload.itemId);
  }
}
