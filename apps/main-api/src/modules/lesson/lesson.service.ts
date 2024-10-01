import { LearnerProfile, LessonRecord } from "@app/database";
import { CompleteLessonDto } from "@app/types/dtos";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { EntityNotFoundError } from "typeorm";

@Injectable()
export class LessonService {
  private readonly logger = new Logger(LessonService.name);

  async completeLesson(dto: CompleteLessonDto, user: ICurrentUser) {
    try {
      const learner = await LearnerProfile.findOneOrFail({ where: { id: user.profileId } });
      const lessonRecord = await LessonRecord.create({
        lessonId: dto.lessonId,
        learnerProfileId: user.profileId,
        correctAnswers: dto.correctAnswers,
        wrongAnswers: dto.wrongAnswers,
        duration: dto.duration,
      }).save();

      const { bonusXP, bonusCarrot } = lessonRecord.getBonusResources();

      const milestones = await learner.updateResources({ bonusXP, bonusCarrot });

      return {
        ...lessonRecord,
        bonusXP,
        bonusCarrot,
        milestones,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException("Learn profile not found");
      }
      throw new BadRequestException(error);
    }
  }
}
