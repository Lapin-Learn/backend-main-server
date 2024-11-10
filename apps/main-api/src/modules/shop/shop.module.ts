import { Module } from "@nestjs/common";
import { ShopController } from "./shop.controller";
import { ShopService } from "./shop.service";
import { ItemEffectFactoryService } from "./item-effect/item-effect-factory.service";

@Module({
  controllers: [ShopController],
  providers: [ShopService, ItemEffectFactoryService],
})
export class ShopModule {}
