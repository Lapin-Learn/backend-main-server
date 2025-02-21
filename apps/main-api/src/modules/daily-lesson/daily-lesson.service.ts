import {
  Instruction,
  LearnerProfile,
  Lesson,
  LessonProcess,
  LessonRecord,
  Question,
  QuestionType,
} from "@app/database";
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
      return Promise.all(
        questionTypes.map(async (questionType) => {
          const { lessonProcesses, ...rest } = questionType;
          const currentProcess = lessonProcesses[0]; //Expect only one process of a question type
          let totalLearningXP = 0;
          let currentBandScore = BandScoreEnum.PRE_IELTS;
          if (currentProcess) {
            currentBandScore = currentProcess.bandScore;
            const lessonsOfBand = await Lesson.find({
              where: { bandScore: currentBandScore, questionTypeId: questionType.id },
              select: {
                id: true,
              },
            });
            const filteredXP = currentProcess.xp.filter((p) => lessonsOfBand.find((l) => l.id === p.lessonId));
            totalLearningXP = filteredXP.reduce((acc, cur) => acc + cur.xp, 0) || 0;
          }
          return {
            ...rest,
            progress: {
              bandScore: currentProcess?.bandScore || BandScoreEnum.PRE_IELTS,
              totalLearningXP,
            },
          };
        })
      );
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
          throw new BadRequestException("The lesson of this band score level is unavailable to you");
        } else {
          where.bandScore = band;
        }
      }

      const lessons = await Lesson.find({
        where,
        order: { order: "ASC" },
      });

      let totalLearningDuration = 0;
      const lessonsProcess = lessons.map((lesson) => {
        lesson.id === currentProcess?.currentLessonId ? (lesson["isCurrent"] = true) : (lesson["isCurrent"] = false);
        const lessonProcess = currentProcess?.xp.find((l) => l.lessonId === lesson.id);
        if (!_.isNil(lessonProcess)) {
          lesson["xp"] = lessonProcess.xp;
          totalLearningDuration += lessonProcess.duration;
        } else {
          lesson["xp"] = 0;
        }
        return lesson;
      });

      return {
        lessons: lessonsProcess,
        totalLearningDuration,
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

      if (dto.isJumpBand) {
        const correctPercentage = (dto.correctAnswers * 100) / (dto.correctAnswers + dto.wrongAnswers);
        await learnerProfileSubject.checkDoneJumpBandTest(learner, correctPercentage, currentLesson);
      } else {
        await learnerProfileSubject.checkAfterFinishLesson(
          learner,
          result.bonusXP,
          dto.duration,
          dto.lessonId,
          currentLesson.questionTypeId
        );
      }

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

  async getJumpBandQuestions(questionTypeId: number, currentUser: ICurrentUser) {
    try {
      let currentBandScore = BandScoreEnum.PRE_IELTS;
      let requiredPercentage = 0;
      const questionTypeProcess = await LessonProcess.findOne({
        where: { questionTypeId, learnerProfileId: currentUser.profileId },
        select: { id: true, bandScore: true, questionTypeId: true },
        relations: {
          questionType: true,
        },
      });

      if (questionTypeProcess) {
        currentBandScore = questionTypeProcess.bandScore;
        requiredPercentage = questionTypeProcess.questionType.bandScoreRequires.find(
          (r) => r.bandScore === currentBandScore
        ).requireXP;
      } else {
        const questionTypeInfo = await QuestionType.findOne({
          where: { id: questionTypeId },
          select: { id: true, bandScoreRequires: true },
        });
        requiredPercentage = questionTypeInfo.bandScoreRequires.find(
          (r) => r.bandScore === currentBandScore
        ).jumpBandPercentage;
      }

      const lessons = await Lesson.find({
        where: { questionTypeId, bandScore: currentBandScore },
        order: {
          order: "DESC",
        },
        relations: {
          questionToLessons: {
            question: true,
          },
        },
      });

      if (!lessons || lessons.length === 0) {
        return "This band do not have any questions yet";
      }

      const questions = lessons.flatMap((lesson) => lesson.questionToLessons.map((ql) => ql.question));
      const totalQuestions = questions.length;
      let requiredQuestions = Math.floor(totalQuestions * requiredPercentage);
      requiredQuestions = requiredQuestions > 10 ? 10 : requiredQuestions;
      requiredQuestions = requiredQuestions === 0 && totalQuestions > 0 ? 1 : requiredQuestions;

      const shuffleArray = (array: Question[]) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };

      const shuffledQuestions = shuffleArray([...questions]);
      const selectedQuestions = shuffledQuestions.slice(0, requiredQuestions);

      return { questions: selectedQuestions, lastLessonId: lessons[0].id };
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}
