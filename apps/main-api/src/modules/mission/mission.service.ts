import { LearnerProfile, Mission, ProfileMissionProgress } from "@app/database";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { MissionHelper } from "./mission.helper";
import { Cron } from "@nestjs/schedule";
import { ProfileMissionProgressStatusEnum } from "@app/types/enums";
import { InjectQueue } from "@nestjs/bullmq";
import { MISSION_CRON_JOB, UPDATE_MISSION_JOB } from "@app/types/constants";
import { Queue } from "bullmq";

@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(
    private readonly missionHelper: MissionHelper,
    @InjectQueue(MISSION_CRON_JOB) private readonly missionQueue: Queue
  ) {}

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

  async receiveRewards(user: ICurrentUser) {
    try {
      const profileMissionProgress = await ProfileMissionProgress.getCompletedMissionProgresses(user.profileId);
      const bonusArray = profileMissionProgress.map((p) => p.mission.getBonusResources());
      const bonus = bonusArray.reduce(
        (acc, b) => {
          return {
            bonusXP: acc.bonusXP + b.bonusXP,
            bonusCarrot: acc.bonusCarrot + b.bonusCarrot,
          };
        },
        {
          bonusXP: 0,
          bonusCarrot: 0,
        }
      );

      if (bonus.bonusXP !== 0 || bonus.bonusCarrot !== 0) {
        const profile = await LearnerProfile.findOneOrFail({ where: { id: user.profileId } });
        await LearnerProfile.save({
          ...profile,
          xp: profile.xp + bonus.bonusXP,
          carrots: profile.carrots + bonus.bonusCarrot,
        });

        // Update mission progress status to 'received'
        await Promise.all(
          (profileMissionProgress || []).map(async (p) => {
            return ProfileMissionProgress.save({
              ...p,
              status: ProfileMissionProgressStatusEnum.RECEIVED,
            });
          })
        );
      }

      return bonus;
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
    await this.missionQueue.add(
      UPDATE_MISSION_JOB,
      {},
      {
        jobId: UPDATE_MISSION_JOB,
        removeOnComplete: true,
        attempts: 1,
      }
    );
  }
}
