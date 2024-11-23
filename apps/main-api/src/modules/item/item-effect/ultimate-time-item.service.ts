import { IItemEffectService } from "./item-effect-abstract.service";
import { BadRequestException, HttpException, Logger } from "@nestjs/common";
import { LearnerProfile, ProfileItem } from "@app/database";
import { ProfileItemStatusEnum } from "@app/types/enums";

export class UltimateTimeItem implements IItemEffectService {
  private readonly logger = new Logger(UltimateTimeItem.name);
  private readonly _profileItem: ProfileItem;
  private readonly _learner: LearnerProfile;
  private readonly TIME = 15 * 60 * 1000; // 15 minutes

  constructor(_profileItem: ProfileItem) {
    this._profileItem = _profileItem;
    this._learner = _profileItem.profile;
  }

  async applyEffect() {
    try {
      // Add one item to the current effect in use
      if (this._profileItem.expAt && this._profileItem.expAt.getTime() > Date.now()) {
        this._profileItem.inUseQuantity += 1;
        this._profileItem.status = ProfileItemStatusEnum.IN_USE;
        this._profileItem.expAt = new Date(
          (this._profileItem.expAt ? this._profileItem.expAt.getTime() : Date.now()) + this.TIME
        );
      } else {
        // Create new effect
        this._profileItem.inUseQuantity = 1;
        this._profileItem.status = ProfileItemStatusEnum.IN_USE;
        this._profileItem.expAt = new Date(Date.now() + this.TIME);
      }
      // Subtract 1 item from inventory
      this._profileItem.quantity -= 1;
      await this._profileItem.save();
      return {
        type: this._profileItem.item.name,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
