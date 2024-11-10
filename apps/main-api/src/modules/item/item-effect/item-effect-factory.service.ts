import { IItem } from "@app/types/interfaces";
import { DefaultItemEffect } from "./item-effect-abstract.service";
import { RandomGiftItemEffect } from "./random-gift-item.service";
import { LearnerProfile } from "@app/database";
import { ItemName } from "@app/types/enums";

export class ItemEffectFactoryService {
  createItemEffectService(item: IItem, learner: LearnerProfile) {
    switch (item.name) {
      case ItemName.RANDOM_GIFT:
        return new RandomGiftItemEffect(learner);
      default:
        return new DefaultItemEffect();
    }
  }
}
