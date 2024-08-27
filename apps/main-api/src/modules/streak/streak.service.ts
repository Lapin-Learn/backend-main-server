import { Account, Streak } from "@app/database";
import { SetTargetStreak } from "@app/types/dtos";
import { ActionNameEnum } from "@app/types/enums";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DataSource } from "typeorm";

@Injectable()
export class StreakService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly dataSource: DataSource) {}

  async setTargetStreak(user: ICurrentUser, dto: SetTargetStreak) {
    try {
      const account = await Account.findOne({ where: { id: user.userId } });
      const streak = account.learnerProfile.streak;
      await Streak.update({ id: streak.id }, { target: dto.target });
      return Streak.findOne({ where: { id: streak.id } });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  @Cron("0 7 * * *") // Midnight in GMT+7 (system uses UTC)
  async resetStreak() {
    try {
      this.logger.log("Reset streak");

      // Midnight yesterday in UTC
      const beginOfYesterday = new Date(
        Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 1, 0, 0, 0, 0)
      );

      // 23:59:59 yesterday in UTC
      const endOfYesterday = new Date(
        Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 1, 23, 59, 59, 999)
      );

      const rawValidAccountIds = await this.dataSource
        .getRepository(Account)
        .createQueryBuilder("accounts")
        .leftJoinAndSelect("accounts.learnerProfile", "learnerProfiles")
        .leftJoinAndSelect("learnerProfiles.activities", "activities")
        .leftJoinAndSelect("activities.action", "actions")
        .where("activities.finishedAt BETWEEN :beginOfYesterday AND :endOfYesterday", {
          beginOfYesterday,
          endOfYesterday,
        })
        .andWhere("actions.name = :actionName", { actionName: ActionNameEnum.DAILY_LOGIN })
        .select("accounts.id")
        .getMany();

      const validAccountIds = rawValidAccountIds.map((account) => account.id);

      const invalidAccounts = await this.dataSource
        .getRepository(Account)
        .createQueryBuilder("accounts")
        .leftJoinAndSelect("accounts.learnerProfile", "learnerProfiles")
        .where(validAccountIds.length > 0 ? "accounts.id NOT IN (:...validAccountIds)" : "1=1", { validAccountIds })
        .leftJoinAndSelect("learnerProfiles.streak", "streaks")
        .getMany();

      for (const account of invalidAccounts) {
        await Streak.update({ id: account.learnerProfile.streak.id }, { current: 0 });
      }
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
