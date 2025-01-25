import { Instruction, LearnerProfile, Lesson, LessonProcess, LessonRecord, QuestionType } from "@app/database";
import { MissionSubject } from "@app/shared-modules/milestone";
import { LearnerProfileSubject } from "@app/shared-modules/milestone/learner.subject";
import { MileStonesObserver } from "@app/shared-modules/milestone/milestone.observer";
import { CompleteLessonDto } from "@app/types/dtos";
import { BandScoreEnum, SkillEnum } from "@app/types/enums";
import { ICurrentUser, IInstruction } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import _ from "lodash";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

@Injectable()
export class DailyLessonService {
  private readonly logger = new Logger(DailyLessonService.name);

  async getQuestionTypesProgressOfLearner(skill: SkillEnum, learnerProfileId: string) {
    try {
      const questionTypes = await QuestionType.getQuestionTypeProgressOfLearner(skill, learnerProfileId);
      return questionTypes.map((questionType) => {
        const { lessonProcesses, ...rest } = questionType;
        const currentProcess = lessonProcesses[0]; //Expect only one process of a question type
        const totalLearningXP = currentProcess?.xp.reduce((acc, cur) => acc + cur.xp, 0) || 0;
        return {
          ...rest,
          progress: {
            bandScore: currentProcess?.bandScore || BandScoreEnum.PRE_IELTS,
            totalLearningXP,
          },
        };
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getContentOfLesson(lessonId: number) {
    try {
      return Lesson.getContentOfLesson(lessonId);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getLessonsInQuestionTypeOfLearner(questionTypeId: number, learnerProfileId: string) {
    try {
      const currentProcess = await LessonProcess.findOne({
        where: {
          learnerProfileId,
          questionTypeId,
        },
      });

      const lessons = await Lesson.find({
        where: { questionTypeId, bandScore: currentProcess?.bandScore || BandScoreEnum.PRE_IELTS },
        order: { order: "ASC" },
      });

      const lessonsProcess = lessons.map((lesson) => {
        lesson.id === currentProcess?.currentLessonId ? (lesson["isCurrent"] = true) : (lesson["isCurrent"] = false);
        const lessonProcess = currentProcess?.xp.find((l) => l.lessonId === lesson.id);
        lesson["xp"] = !_.isNil(lessonProcess) ? lessonProcess.xp : 0;
        return lesson;
      });

      return {
        lessons: lessonsProcess,
        totalLearningDuration: currentProcess?.xp.reduce((acc, cur) => acc + cur.duration, 0) || 0,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getInstructionsOfQuestionType(questionTypeId: number): Promise<IInstruction> {
    try {
      return Instruction.findOne({
        where: { questionTypeId },
        relations: {
          image: true,
          audio: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

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

      const result = await learner.updateResources({ bonusXP, bonusCarrot });

      const observer = new MileStonesObserver();
      const learnerProfileSubject = new LearnerProfileSubject(learner, observer);
      await learnerProfileSubject.checkProfileChange();
      await learnerProfileSubject.checkAfterFinishLesson(
        result.bonusXP,
        dto.duration,
        dto.lessonId,
        currentLesson.questionTypeId
      );
      const missionSuject = new MissionSubject(learner, observer);
      await missionSuject.checkMissionProgress();

      const milestones = observer.getMileStones();

      return {
        ...lessonRecord,
        ...result,
        milestones,
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
