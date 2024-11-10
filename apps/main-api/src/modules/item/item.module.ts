import { Module } from "@nestjs/common";
import { ShopController } from "./shop.controller";
import { InventoryController } from "./inventory.controller";
import { ShopService } from "./shop.service";
import { InventoryService } from "./inventory.service";

@Module({
  controllers: [ShopController, InventoryController],
  providers: [ShopService, InventoryService],
})
export class ItemModule {}
