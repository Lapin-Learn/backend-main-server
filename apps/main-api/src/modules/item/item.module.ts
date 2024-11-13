import { Module } from "@nestjs/common";
import { ShopController, ShopService } from "./shop";
import { InventoryController, InventoryService } from "./inventory";
import { ItemEffectFactoryService } from "./item-effect/item-effect-factory.service";

@Module({
  controllers: [ShopController, InventoryController],
  providers: [ShopService, InventoryService, ItemEffectFactoryService],
})
export class ItemModule {}
