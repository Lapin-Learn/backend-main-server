import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ShopService } from "./shop.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser, Roles } from "../../decorators";
import { AccountRoleEnum } from "@app/types/enums";
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
  @ApiResponse({ status: 200, description: "Items retrieved successfully" })
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
}
