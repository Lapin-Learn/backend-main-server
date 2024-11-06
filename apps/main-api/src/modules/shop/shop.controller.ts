import { Controller, Get, UseGuards } from "@nestjs/common";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ShopService } from "./shop.service";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../decorators";
import { AccountRoleEnum } from "@app/types/enums";

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

  @Get()
  @ApiResponse({ status: 200, description: "Items retrieved successfully" })
  @Roles(AccountRoleEnum.LEARNER)
  async getItemsInShop() {
    return this.shopService.getItemsInShop();
  }
}
