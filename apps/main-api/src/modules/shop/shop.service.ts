import { Item } from "@app/database";
import { ItemCategoryEnum } from "@app/types/enums";
import { IItem } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import _ from "lodash";

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  async getItemsInShop() {
    try {
      const items: IItem[] = await Item.find();

      // Add 'IDENTIFICATION' as popular item category
      const identification = _.find(items, { name: "IDENTIFICATION" });
      items.push({
        ...identification,
        category: ItemCategoryEnum.POPULAR,
      });

      return _.groupBy(items, (item: IItem) => item.category);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
