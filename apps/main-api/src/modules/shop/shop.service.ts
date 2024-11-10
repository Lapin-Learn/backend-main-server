import { Item, LearnerProfile, ProfileItem } from "@app/database";
import { ICurrentUser, IItem } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ItemEffectFactoryService } from "./item-effect/item-effect-factory.service";

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(private readonly itemEffectFactoryService: ItemEffectFactoryService) {}
  async getItemsInShop() {
    try {
      const items: IItem[] = await Item.find();

      return items.map((item) => {
        const popular = (() => {
          switch (item.name) {
            case "STREAK_FREEZE":
              return "1";
            case "RANDOM_GIFT":
              return "1";
            case "ULTIMATE_TIME":
              return "1";
            case "IDENTIFICATION":
              return "2";
            default:
              return "1";
          }
        })();

        return {
          ...item,
          popular,
          isPopular: item.name === "IDENTIFICATION" ? true : false,
        };
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async useItemInInventory(user: ICurrentUser, itemId: string) {
    try {
      const items = await ProfileItem.findOne({
        where: { profileId: user.profileId, itemId },
        relations: ["item", "profile"],
      });
      const learner = await LearnerProfile.findOneOrFail({
        where: { id: user.profileId },
      });
      if (!items || items.quantity <= 0) {
        throw new BadRequestException("ITEM_NOT_FOUND");
      }
      // Subtract 1 item from inventory
      items.quantity -= 1;
      await items.save();
      const itemEffect = this.itemEffectFactoryService.createItemEffectService(items.item, learner);
      return itemEffect.applyEffect();
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
