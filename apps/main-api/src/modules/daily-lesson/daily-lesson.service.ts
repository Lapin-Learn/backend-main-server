import { Lesson, LessonProcess, QuestionType } from "@app/database";
import { BandScoreEnum, SkillEnum } from "@app/types/enums";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import _ from "lodash";

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
            bandScore: currentProcess?.band_score || BandScoreEnum.PRE_IELTS,
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
        where: { questionTypeId, bandScore: currentProcess?.band_score || BandScoreEnum.PRE_IELTS },
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
}
