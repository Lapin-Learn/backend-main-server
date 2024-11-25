import { IItemEffectService } from "./item-effect-abstract.service";
import { BadRequestException, Logger } from "@nestjs/common";
import { LearnerProfile, ProfileItem } from "@app/database";
import { ProfileItemStatusEnum } from "@app/types/enums";
import moment from "moment-timezone";
import { VN_TIME_ZONE } from "@app/types/constants";

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
      const now = moment().tz(VN_TIME_ZONE);
      // Add one item to the current effect in use
      if (this._profileItem.expAt && moment(this._profileItem.expAt).isAfter(now)) {
        this._profileItem.inUseQuantity += 1;
        this._profileItem.status = ProfileItemStatusEnum.IN_USE;
        const newExpAt = moment(this._profileItem.expAt).add(this.TIME, "ms");
        this._profileItem.expAt = this._profileItem.expAt ? this._profileItem.expAt : newExpAt.toDate();
      } else {
        // Create new effect
        this._profileItem.inUseQuantity = 1;
        this._profileItem.status = ProfileItemStatusEnum.IN_USE;
        this._profileItem.expAt = now.add(this.TIME, "ms").toDate();
      }
      // Subtract 1 item from inventory
      this._profileItem.quantity -= 1;
      await this._profileItem.save();
      return {
        type: this._profileItem.item.name,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
