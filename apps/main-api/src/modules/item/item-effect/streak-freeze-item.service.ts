import { ItemEffectAbstractService } from "./item-effect-abstract.service";
import { BadRequestException, HttpException, Logger } from "@nestjs/common";
import { ActionNameEnum } from "@app/types/enums";
import { Action, Activity, LearnerProfile, ProfileItem } from "@app/database";
import moment from "moment-timezone";
import { VN_TIME_ZONE } from "@app/types/constants";

export class StreakItemService extends ItemEffectAbstractService {
  private readonly logger = new Logger(StreakItemService.name);
  private readonly _profileItem: ProfileItem;
  private readonly _learner: LearnerProfile;

  constructor(_profileItem: ProfileItem) {
    super();
    this._profileItem = _profileItem;
    this._learner = _profileItem.profile;
  }

  async applyEffect() {
    try {
      // Can only extend streak yesterday, do not allow to extend streak today
      const beginYesterday = moment().tz(VN_TIME_ZONE).subtract(1, "days").startOf("day").utc(true).toDate();
      const endYesterday = moment().tz(VN_TIME_ZONE).subtract(1, "days").endOf("day").utc(true).toDate();

      // Check if the learner has extended the streak yesterday
      const isExtendedStreakYesterday = await Activity.getBonusStreakPoint(
        this._learner.id,
        beginYesterday,
        endYesterday
      );
      if (!isExtendedStreakYesterday) {
        throw new BadRequestException("ALREADY_EXTENDED_STREAK_YESTERDAY");
      }

      const freezeStreakAction = await Action.findOneOrFail({ where: { name: ActionNameEnum.FREEZE_STREAK } });
      await Activity.save({
        profileId: this._learner.id,
        actionId: freezeStreakAction.id,
      });
      await this._learner.streak.increaseStreak();

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
