import { LearnerProfile, Lesson, LessonRecord, Mission } from "@app/database";
import { CompleteLessonDto } from "@app/types/dtos";
import { ICurrentUser, IMileStoneInfo, IProfileMissionProgress } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { EntityNotFoundError, QueryFailedError } from "typeorm";
import { MissionFactoryService } from "@app/shared-modules/mission-factory";
import { MileStonesEnum, ProfileMissionProgressStatusEnum } from "@app/types/enums";

@Injectable()
export class LessonService {
  private readonly logger = new Logger(LessonService.name);

  constructor(private readonly missionFactoryService: MissionFactoryService) {}
  async completeLesson(dto: CompleteLessonDto, user: ICurrentUser) {
    try {
      const learner = await LearnerProfile.findOneOrFail({
        where: { id: user.profileId },
        relations: { lessonProcesses: true },
      });

      const lessonRecord = await LessonRecord.create({
        lessonId: dto.lessonId,
        learnerProfileId: user.profileId,
        correctAnswers: dto.correctAnswers,
        wrongAnswers: dto.wrongAnswers,
        duration: dto.duration,
      }).save();

      const currentLesson = await Lesson.findOneOrFail({
        where: { id: dto.lessonId },
        relations: { questionType: true },
      });

      const { bonusXP, bonusCarrot } = lessonRecord.getBonusResources();

      await learner.updateResources({ bonusXP, bonusCarrot });

      const profileMilestones = await learner.getProfileMileStones();
      const learnProgressMilestones = await learner.getLearnProcessMileStones(
        dto,
        bonusXP,
        currentLesson.questionType.id
      );

      const missionMilestones: IMileStoneInfo<IProfileMissionProgress[]> = {
        type: MileStonesEnum.IS_MISSION_COMPLETED,
        newValue: [],
      };

      const missions = await Mission.getMissions();

      for (const mission of missions) {
        const isCompleteMission = learner.profileMissionsProgress.some(
          (m) =>
            m.missionId === mission.id &&
            (m.status === ProfileMissionProgressStatusEnum.COMPLETED ||
              m.status === ProfileMissionProgressStatusEnum.RECEIVED)
        );
        if (!isCompleteMission) {
          const missionInstance = this.missionFactoryService.createMissionService(mission, learner);
          const isCompleted = await missionInstance.isMissionCompleted();
          if (isCompleted) {
            const missionProgress = await learner.handleMissionComplete(mission);
            missionProgress && missionMilestones.newValue.push(missionProgress);
          }
        }
      }

      return {
        ...lessonRecord,
        bonusXP,
        bonusCarrot,
        milestones: [
          ...profileMilestones,
          ...learnProgressMilestones,
          ...(missionMilestones.newValue.length > 0 ? [missionMilestones] : []),
        ],
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException("Learner profile not found");
      } else if (error instanceof QueryFailedError && error.message.includes("violates foreign key constraint")) {
        throw new BadRequestException("Lesson not found");
      }
      throw new BadRequestException(error);
    }
  }
}
