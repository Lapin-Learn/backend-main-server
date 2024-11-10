import { IItem } from "@app/types/interfaces";
import { DefaultItemEffect } from "./item-effect-abstract.service";
import { RandomGiftItemEffect } from "./random-gift-item.service";
import { LearnerProfile } from "@app/database";

enum ItemName {
  STREAK_FREEZE = "STREAK_FREEZE",
  RANDOM_GIFT = "RANDOM_GIFT",
  ULTIMATE_TIME = "ULTIMATE_TIME",
  IDENTIFICATION = "IDENTIFICATION",
}
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
