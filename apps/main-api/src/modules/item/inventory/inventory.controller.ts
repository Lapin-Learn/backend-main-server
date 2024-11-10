import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { FirebaseJwtAuthGuard } from "../../../guards";
import { ApiDefaultResponses, CurrentUser, Roles } from "../../../decorators";
import { AccountRoleEnum } from "@app/types/enums";
import { InventoryService } from "./inventory.service";
import { ICurrentUser } from "@app/types/interfaces";
import { UseItemDto } from "@app/types/dtos";
import { UseRandomGiftCarrotsResponseDto, UseRandomGiftItemResponseDto } from "@app/types/response-dtos";
import { InventoryResponseDto } from "@app/types/response-dtos/items/inventory-response.dto";

@ApiTags("Shop and items")
@ApiBearerAuth()
@ApiDefaultResponses()
@Controller("inventories")
@UseGuards(FirebaseJwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: "Get all items in user's inventory" })
  @ApiOkResponse({ type: [InventoryResponseDto] })
  @Get()
  @Roles(AccountRoleEnum.LEARNER)
  async getInventory(@CurrentUser() user: ICurrentUser) {
    return this.inventoryService.getInventory(user);
  }

  @ApiOperation({ summary: "Use an item from the inventory" })
  @ApiOkResponse({
    content: {
      "application/json": {
        schema: {
          oneOf: [
            { $ref: getSchemaPath(UseRandomGiftCarrotsResponseDto) },
            { $ref: getSchemaPath(UseRandomGiftItemResponseDto) },
          ],
        },
      },
    },
  })
  @ApiExtraModels(UseRandomGiftCarrotsResponseDto, UseRandomGiftItemResponseDto)
  @Put("use-item")
  @Roles(AccountRoleEnum.LEARNER)
  async useItemInInventory(@CurrentUser() user: ICurrentUser, @Body() payload: UseItemDto) {
    console.log(payload);
    return this.inventoryService.useItemInInventory(user, payload.itemId);
  }
}
