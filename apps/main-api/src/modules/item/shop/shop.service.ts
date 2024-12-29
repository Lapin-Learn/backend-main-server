import { Item, LearnerProfile, ProfileItem } from "@app/database";
import { BuyItemDto } from "@app/types/dtos";
import { ICurrentUser, IItem } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ItemName } from "@app/types/enums";

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  async getItemsInShop() {
    try {
      const items: IItem[] = await Item.find();

      return items
        .filter((item) => item.name !== ItemName.IDENTIFICATION)
        .map((item) => {
          const popular = (() => {
            switch (item.name) {
              case ItemName.STREAK_FREEZE:
              case ItemName.RANDOM_GIFT:
              case ItemName.ULTIMATE_TIME:
                return "1";
              case ItemName.IDENTIFICATION:
                return "2";
              default:
                return "1";
            }
          })();

          return {
            ...item,
            popular,
            isPopular: item.name === ItemName.IDENTIFICATION ? true : false,
          };
        });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async buyItem(user: ICurrentUser, dto: BuyItemDto) {
    try {
      const item = await Item.findOneByOrFail({ id: dto.id });
      if (item.price[dto.quantity] === undefined) {
        throw new BadRequestException("Invalid quantity for this item");
      }

      const totalPrice = item.price[dto.quantity];
      const learner = await LearnerProfile.findOneByOrFail({ id: user.profileId });
      if (learner.carrots < totalPrice) {
        throw new BadRequestException("Not enough balance to buy this item");
      }

      const inventoryItem = await ProfileItem.findOne({
        where: { profileId: user.profileId, itemId: item.id },
      });
      const updatedInventoryItem = await ProfileItem.save({
        ...inventoryItem,
        itemId: item.id,
        profileId: user.profileId,
        quantity: inventoryItem?.quantity + dto.quantity || dto.quantity,
      });
      await LearnerProfile.save({
        ...learner,
        carrots: learner.carrots - totalPrice,
      });

      return updatedInventoryItem;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
