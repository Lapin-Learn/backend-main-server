import { ProfileItem } from "@app/database";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { MoreThan } from "typeorm";

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
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
}
