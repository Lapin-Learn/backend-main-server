import { QuestHandler } from "@app/types/abstracts";
import { MileStonesEnum, MissionCategoryNameEnum, ProfileMissionProgressStatusEnum } from "@app/types/enums";
import {
  PercentageScoreHandler,
  RequiredDurationHandler,
  DistinctSkillsHandler,
  ExceedLearningStreak,
} from "../mission-handlers";
import { LearnerProfile, Mission, ProfileMissionProgress } from "@app/database";
import { MileStonesObserver } from "./milestone.observer";

export class MissionSubject {
  private handlerMap = new Map<MissionCategoryNameEnum, new () => QuestHandler>([
    [MissionCategoryNameEnum.COMPLETE_LESSON_WITH_PERCENTAGE_SCORE, PercentageScoreHandler],
    [MissionCategoryNameEnum.TOTAL_DURATION_OF_LEARN_DAILY_LESSON, RequiredDurationHandler],
    [MissionCategoryNameEnum.COMPLETE_LESSON_WITH_DIFFERENT_SKILLS, DistinctSkillsHandler],
    [MissionCategoryNameEnum.EXCEED_LEARNING_STREAK_WITHOUT_BREAK, ExceedLearningStreak],
  ]);
  private readonly observer: MileStonesObserver;
  private readonly learner: LearnerProfile;

  private handler: QuestHandler;

  constructor(learner: LearnerProfile, observer: MileStonesObserver) {
    this.learner = learner;
    this.observer = observer;
  }

  setHandler(category: MissionCategoryNameEnum) {
    const handler = this.handlerMap.get(category);
    if (!handler) throw new Error("Invalid mission category");
    this.handler = new handler();
  }

  private notify(type: MileStonesEnum, newValue: any) {
    this.observer.update(type, newValue);
  }

  async checkMissionProgress(): Promise<void> {
    const updatedProgress: ProfileMissionProgress[] = [];

    const missions = await Mission.getMissions();

    for (const mission of missions) {
      const isCompleteMission = this.learner.profileMissionsProgress.some(
        (m) =>
          m.missionId === mission.id &&
          (m.status === ProfileMissionProgressStatusEnum.COMPLETED ||
            m.status === ProfileMissionProgressStatusEnum.RECEIVED)
      );

      if (!isCompleteMission) {
        let isUpdated = false;
        this.setHandler(mission.quest.category);
        await this.handler.checkQuestCompleted(mission.quest.requirements, this.learner);

        let progress = await ProfileMissionProgress.findOne({
          where: {
            missionId: mission.id,
            profileId: this.learner.id,
          },
        });

        if (!progress) {
          const current = await this.handler.getUpdatedProgress(0);
          const status =
            current >= mission.quest.quantity
              ? ProfileMissionProgressStatusEnum.COMPLETED
              : ProfileMissionProgressStatusEnum.ASSIGNED;

          progress = await ProfileMissionProgress.save({
            profileId: this.learner.id,
            current,
            status,
            mission,
          });
          isUpdated = true;
        } else {
          const updatedCurrent = await this.handler.getUpdatedProgress(progress.current);
          if (updatedCurrent != progress.current) {
            isUpdated = true;
          }
          progress.current = updatedCurrent;
          progress.status =
            updatedCurrent === mission.quest.quantity ? ProfileMissionProgressStatusEnum.COMPLETED : progress.status;

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
  }
}
