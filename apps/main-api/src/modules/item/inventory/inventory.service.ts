import { LearnerProfile, ProfileItem } from "@app/database";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { MoreThan } from "typeorm";
import { ItemEffectFactoryService } from "../item-effect/item-effect-factory.service";

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly itemEffectFactoryService: ItemEffectFactoryService) {}

  getInventory(user: ICurrentUser) {
    try {
      return ProfileItem.find({
        where: { profileId: user.profileId, quantity: MoreThan(0) },
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
