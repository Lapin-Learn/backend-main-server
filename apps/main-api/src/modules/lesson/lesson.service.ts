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
      // Perform upsert operation
      await LessonRecord.upsert(
        {
          lessonId: dto.lessonId,
          learnerProfileId: user.profileId,
          correctAnswers: dto.correctAnswers,
          wrongAnswers: dto.wrongAnswers,
          duration: dto.duration,
        },
        {
          conflictPaths: ["lessonId", "learnerProfileId"],
          skipUpdateIfNoValuesChanged: true,
        }
      );

      return {
        lessonId: dto.lessonId,
        learnerProfileId: user.profileId,
        correctAnswers: dto.correctAnswers,
        wrongAnswers: dto.wrongAnswers,
        duration: dto.duration,

        xp: calcXP(dto.correctAnswers, dto.wrongAnswers),
        carrots: calcCarrots(dto.duration),
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
