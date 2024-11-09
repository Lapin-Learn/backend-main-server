import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FirebaseJwtAuthGuard } from "../../guards";
import { CurrentUser, Roles } from "../../decorators";
import { AccountRoleEnum } from "@app/types/enums";
import { InventoryService } from "./inventory.service";
import { ICurrentUser } from "@app/types/interfaces";

@Controller("inventories")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@ApiResponse({ status: 400, description: "Bad request" })
@ApiResponse({ status: 401, description: "Unauthorized" })
@ApiResponse({ status: 403, description: "Forbidden" })
@ApiResponse({ status: 500, description: "Internal server error" })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: "Get inventory" })
  @ApiResponse({ status: 200, description: "Inventory retrieved successfully" })
  @Get()
  @Roles(AccountRoleEnum.LEARNER)
  async getInventory(@CurrentUser() user: ICurrentUser) {
    return this.inventoryService.getInventory(user);
  }
}
