import { LessonRecord } from "@app/database";
import { CompleteLessonDto } from "@app/types/dtos";
import { ICurrentUser } from "@app/types/interfaces";
import { calcCarrots, calcXP } from "@app/utils/helper";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class LessonService {
  private readonly logger = new Logger(LessonService.name);

  async completeLesson(dto: CompleteLessonDto, user: ICurrentUser) {
    try {
      const lessonRecord = await LessonRecord.save({
        lessonId: dto.lessonId,
        learnerProfileId: user.profileId,
        correctAnswers: dto.correctAnswers,
        wrongAnswers: dto.wrongAnswers,
        duration: dto.duration,
      });

      return {
        ...lessonRecord,
        xp: calcXP(dto.correctAnswers, dto.wrongAnswers),
        carrots: calcCarrots(dto.duration),
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
