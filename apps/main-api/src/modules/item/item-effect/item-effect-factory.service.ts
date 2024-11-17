import { DefaultItemEffect } from "./item-effect-abstract.service";
import { RandomGiftItemEffect } from "./random-gift-item.service";
import { ProfileItem } from "@app/database";
import { ItemName } from "@app/types/enums";
import { StreakItemService } from "./streak-freeze-item.service";

export class ItemEffectFactoryService {
  createItemEffectService(profileItem: ProfileItem) {
    switch (profileItem.item.name) {
      case ItemName.RANDOM_GIFT:
        return new RandomGiftItemEffect(profileItem);
      case ItemName.STREAK_FREEZE:
        return new StreakItemService(profileItem);
      default:
        return new DefaultItemEffect();
    }
  }
}
