import { Mission, ProfileMissionProgress, Quest } from "@app/database";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { MissionHelper } from "./mission.helper";
import { Cron } from "@nestjs/schedule";
import moment from "moment-timezone";
import { IntervalTypeEnum } from "@app/types/enums";

@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(private readonly missionHelper: MissionHelper) {}

  async getMissions(user: ICurrentUser) {
    try {
      const missions = await Mission.getMissions();
      const missionProgress = await ProfileMissionProgress.getMissionProgresses(user.profileId);
      return this.missionHelper.buildMissionsResponseData(missionProgress, missions);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  // Remove and update mission at midnight GMT+7
  @Cron("0 0 * * *", {
    timeZone: "Asia/Saigon",
  })
  async handleUpdateMission() {
    try {
      this.logger.log("Update missions");

      // Check if today is the first day of month
      const isFirstDayOfMonth = moment().tz("Asia/Saigon").date() === 1;

      // Random mission
      const randomDailyQuests = await Quest.randAndFind(IntervalTypeEnum.DAILY, 3);
      const randomMonthlyQuests = isFirstDayOfMonth ? await Quest.randAndFind(IntervalTypeEnum.MONTHLY, 1) : [];
      const randomQuests = [...randomDailyQuests, ...randomMonthlyQuests];

      // Save all random missions as global missions
      // Quantity is random between 2 and 5
      randomQuests.map((q) => {
        Mission.save({
          type: q.type,
          questId: q.id,
          quantity: Math.floor(Math.random() * (5 - 2 + 1)) + 2,
        });
      });
    } catch (error) {
      this.logger.log(error);
    }
  }
}
