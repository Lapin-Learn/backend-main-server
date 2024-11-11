import { ItemEffectAbstractService } from "./item-effect-abstract.service";
import { Logger } from "@nestjs/common";
import { RandomGiftType } from "@app/types/enums";
import { Item, LearnerProfile, ProfileItem } from "@app/database";
import { IItem } from "@app/types/interfaces";

export class RandomGiftItemEffect extends ItemEffectAbstractService {
  private readonly logger = new Logger(RandomGiftItemEffect.name);
  private readonly _profileItem: ProfileItem;
  private readonly _learner: LearnerProfile;

  constructor(_profileItem: ProfileItem) {
    super();
    this._profileItem = _profileItem;
    this._learner = _profileItem.profile;
  }

  private getRandomCarrots(
    lowerBound: number,
    upperBound: number
  ): {
    type: RandomGiftType.CARROTS;
    value: number;
  } {
    return {
      type: RandomGiftType.CARROTS,
      value: Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound),
    };
  }

  private async getRandomItem(): Promise<{
    type: RandomGiftType.ITEM;
    value: IItem;
  }> {
    const items: IItem[] = await Item.find();
    const randomItemList = items.filter((item) => item.name !== "RANDOM_GIFT");
    const randomItem = randomItemList[Math.floor(Math.random() * randomItemList.length)];
    return {
      type: RandomGiftType.ITEM,
      value: randomItem,
    };
  }

  private async getRandomGift(): Promise<
    { type: RandomGiftType.CARROTS; value: number } | { type: RandomGiftType.ITEM; value: IItem }
  > {
    const random = Math.random();
    switch (true) {
      case random < 0.5: // 50%
        return this.getRandomCarrots(80, 150);
      case random < 0.8: // 30%
        return this.getRandomCarrots(151, 200);
      default: // 20%
        return this.getRandomItem();
    }
  }

  async applyEffect() {
    try {
      const result = await this.getRandomGift();
      if (result.type === RandomGiftType.CARROTS) {
        // Add the carrot value to the user's profile
        await this._learner.updateResources({ bonusCarrot: result.value });
      } else {
        // Add the random item to the user's inventory
        const item = await ProfileItem.findOne({
          where: { profileId: this._learner.id, itemId: result.value.id },
        });
        if (item) {
          item.quantity += 1;
          await item.save();
        } else {
          await ProfileItem.save({
            profileId: this._learner.id,
            itemId: result.value.id,
            quantity: 1,
          });
        }
      }

      // Subtract 1 item from inventory
      this._profileItem.quantity -= 1;
      await this._profileItem.save();

      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
