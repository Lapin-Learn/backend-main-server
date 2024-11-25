import { ProfileItem } from "@app/database";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ItemEffectFactoryService } from "../item-effect/item-effect-factory.service";

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly itemEffectFactoryService: ItemEffectFactoryService) {}

  async getInventory(user: ICurrentUser) {
    try {
      const profileItems = await ProfileItem.find({
        where: { profileId: user.profileId },
      });
      const items = await Promise.all(
        profileItems.map(async (profileItem) => {
          const { quantity, expAt, item } = await profileItem.resetItemStatus();
          return { ...item, quantity, expAt };
        })
      );
      return items;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async useItemInInventory(user: ICurrentUser, itemId: string) {
    try {
      const item = await ProfileItem.findOne({
        where: { profileId: user.profileId, itemId },
        relations: ["item", "profile"],
      });
      if (!item || item.quantity <= 0) {
        throw new BadRequestException("ITEM_NOT_FOUND");
      }
      const itemEffect = this.itemEffectFactoryService.createItemEffectService(item);
      return itemEffect.applyEffect();
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
