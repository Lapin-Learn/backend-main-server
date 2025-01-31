import { QuestHandler } from "@app/types/abstracts";
import { MileStonesEnum, MissionCategoryNameEnum, ProfileMissionProgressStatusEnum } from "@app/types/enums";
import { LearnerProfile, Mission, ProfileMissionProgress } from "@app/database";
import { MileStonesObserver } from "../observers";
import { Logger } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { QuestHandlerContainer } from "../quest-handlers";

@Injectable()
export class MissionSubject {
  private handler: QuestHandler;

  private readonly logger = new Logger(MissionSubject.name);

  constructor(
    private readonly observer: MileStonesObserver,
    private readonly questHandlerContainer: QuestHandlerContainer
  ) {}

  private setHandler(category: MissionCategoryNameEnum) {
    this.handler = this.questHandlerContainer.resolve(category);
  }

  private notify(type: MileStonesEnum, newValue: any) {
    this.observer.update(type, newValue);
  }

  async checkMissionProgress(learner: LearnerProfile): Promise<void> {
    try {
      const updatedProgress: ProfileMissionProgress[] = [];

      const missions = await Mission.getMissions();

      for (const mission of missions) {
        const isCompleteMission = learner.profileMissionsProgress.some(
          (m) =>
            m.missionId === mission.id &&
            (m.status === ProfileMissionProgressStatusEnum.COMPLETED ||
              m.status === ProfileMissionProgressStatusEnum.RECEIVED)
        );

        if (!isCompleteMission) {
          let isUpdated = false;
          this.setHandler(mission.quest.category);
          await this.handler.checkQuestCompleted(mission.quest.requirements, learner);

          let progress = await ProfileMissionProgress.findOne({
            where: {
              missionId: mission.id,
              profileId: learner.id,
            },
          });

          if (!progress) {
            const current = await this.handler.getUpdatedProgress(0);
            const status =
              current >= mission.quest.quantity
                ? ProfileMissionProgressStatusEnum.COMPLETED
                : ProfileMissionProgressStatusEnum.ASSIGNED;

            progress = await ProfileMissionProgress.save({
              profileId: learner.id,
              current,
              status,
              mission,
            });
            if (current > 0) isUpdated = true;
          } else {
            const updatedCurrent = await this.handler.getUpdatedProgress(progress.current);
            if (updatedCurrent != progress.current) {
              isUpdated = true;
            }
            progress.current = updatedCurrent;
            updatedCurrent >= mission.quest.quantity && (progress.status = ProfileMissionProgressStatusEnum.COMPLETED);

            progress = await ProfileMissionProgress.save({
              ...progress,
            });
          }
          if (isUpdated) {
            updatedProgress.push(progress);
          }
        }
      }
      if (updatedProgress.length > 0) this.notify(MileStonesEnum.IS_MISSION_COMPLETED, updatedProgress);
    } catch (error) {
      this.logger.error(error);
      throw error(error);
    }
  }
}
