import { Item } from "@app/database";
import { IItem } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

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
}
