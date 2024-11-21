import { IItemEffectService } from "./item-effect-abstract.service";
import { BadRequestException, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ActionNameEnum } from "@app/types/enums";
import { Action, Activity, LearnerProfile, ProfileItem } from "@app/database";
import { EntityNotFoundError } from "typeorm";

export class StreakItemService implements IItemEffectService {
  private readonly logger = new Logger(StreakItemService.name);
  private readonly _profileItem: ProfileItem;
  private readonly _learner: LearnerProfile;

  constructor(_profileItem: ProfileItem) {
    this._profileItem = _profileItem;
    this._learner = _profileItem.profile;
  }

  async applyEffect() {
    try {
      const freezeStreakAction = await Action.findByName(ActionNameEnum.FREEZE_STREAK);

      // Can only extend streak once a day and if yesterday learner didn't learn
      // and today must not learn anything yet.
      // If user learn today, they can't extend streak because streak will reset.
      if (this._learner.streak.extended) {
        throw new BadRequestException("ALREADY_EXTENDED_STREAK");
      }

      if (this._learner.streak.current === 0) {
        throw new BadRequestException("STREAK_NOT_STARTED");
      }

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
      if (error instanceof EntityNotFoundError) {
        throw new HttpException("ACTION_NOT_FOUND", HttpStatus.INTERNAL_SERVER_ERROR);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
