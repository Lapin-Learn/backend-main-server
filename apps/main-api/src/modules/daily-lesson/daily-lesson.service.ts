import { Instruction, LearnerProfile, Lesson, LessonProcess, LessonRecord, QuestionType } from "@app/database";
import { MileStonesObserver } from "@app/shared-modules/observers";
import { MissionSubject, LearnerProfileSubject } from "@app/shared-modules/subjects";
import { BandScoreOrder, LEARNER_SUBJECT_FACTORY, MISSION_SUBJECT_FACTORY } from "@app/types/constants";
import { CompleteLessonDto } from "@app/types/dtos";
import { BandScoreEnum, SkillEnum } from "@app/types/enums";
import { ICurrentUser, IInstruction } from "@app/types/interfaces";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import _ from "lodash";
import { EntityNotFoundError, FindOptionsWhere, QueryFailedError } from "typeorm";

@Injectable()
export class DailyLessonService {
  private readonly logger = new Logger(DailyLessonService.name);

  constructor(
    @Inject(MISSION_SUBJECT_FACTORY)
    private readonly missionSubjectFactory: (observer: MileStonesObserver) => MissionSubject,
    @Inject(LEARNER_SUBJECT_FACTORY)
    private readonly learnerSubjectFactory: (observer: MileStonesObserver) => LearnerProfileSubject,
    private readonly mileStonesObserver: MileStonesObserver
  ) {}
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

  async getLessonsInQuestionTypeOfLearner(questionTypeId: number, learnerProfileId: string, band?: BandScoreEnum) {
    try {
      const currentProcess = await LessonProcess.findOne({
        where: {
          learnerProfileId,
          questionTypeId,
        },
      });

      const where: FindOptionsWhere<Lesson> = {
        questionTypeId,
      };

      if (!currentProcess) {
        where.bandScore = BandScoreEnum.PRE_IELTS;
      } else {
        if (!band) {
          where.bandScore = currentProcess.bandScore;
        } else if (BandScoreOrder.indexOf(currentProcess.bandScore) < BandScoreOrder.indexOf(band)) {
          throw new BadRequestException("This band is unavailable for you");
        } else {
          where.bandScore = band;
        }
      }

      const lessons = await Lesson.find({
        where,
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

      const learnerProfileSubject = this.learnerSubjectFactory(this.mileStonesObserver);
      await learnerProfileSubject.checkProfileChange(learner);
      await learnerProfileSubject.checkAfterFinishLesson(
        learner,
        result.bonusXP,
        dto.duration,
        dto.lessonId,
        currentLesson.questionTypeId
      );

      const missionSubject = this.missionSubjectFactory(this.mileStonesObserver);
      await missionSubject.checkMissionProgress(learner);

      const milestones = this.mileStonesObserver.getMileStones();

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

  async getListLessonBandScore(questionTypeId: number, learnerProfileId: string) {
    try {
      const currentProcess = await LessonProcess.findOne({
        where: { learnerProfileId, questionTypeId },
      });

      return BandScoreOrder.slice(0, BandScoreOrder.indexOf(currentProcess.bandScore) + 1);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}
