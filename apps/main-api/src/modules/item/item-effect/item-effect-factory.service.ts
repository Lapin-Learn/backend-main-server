import { DefaultItemEffect } from "./item-effect-abstract.service";
import { RandomGiftItemEffect } from "./random-gift-item.service";
import { ProfileItem } from "@app/database";
import { ItemName } from "@app/types/enums";

export class ItemEffectFactoryService {
  createItemEffectService(profileItem: ProfileItem) {
    switch (profileItem.item.name) {
      case ItemName.RANDOM_GIFT:
        return new RandomGiftItemEffect(profileItem);
      default:
        return new DefaultItemEffect();
    }
  }
}
